import { BadRequestException, Injectable } from "@nestjs/common";
import { PaginatePostDto } from "../posts/dto/paginatePostDto";
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from "typeorm";
import { BaseModel } from "./entity/base.entity";
import { BasePaginatePostDto } from "./dto/base-pagination.dto";
import { FILTER_MAPPER } from "./const/filter-mapper.const";
import { find } from "rxjs";
import { HOST, PROTOCOL } from "./const/env.const";

@Injectable()
export class CommonService {
  paginate<T extends BaseModel>(
    dto: PaginatePostDto,
    repository: Repository<T>, //어떤 리포지토리던 받을수있음 (postRepository, userRepository...)
    overrideFindOptions: FindManyOptions<T> = {}, //추가 옵션 (연관 table 속성 표시할건지 등)
    path : String, //url 의 path ('localhost:3000/posts 의 posts)
  ){
    if(dto.page){ //페이지가 있으면 페이지기반 페이징
      return this.pagePaginate(
        dto,
        repository,
        overrideFindOptions,
      )
    }
    else{
      return this.cursorPaginate(
        dto,
        repository,
        overrideFindOptions,
        path,
      )
    }

  }

  private async pagePaginate<T extends BaseModel>(
    dto: PaginatePostDto,
    repository: Repository<T>, //어떤 리포지토리던 받을수있음 (postRepository, userRepository...)
    overrideFindOptions: FindManyOptions<T> = {}, //추가 옵션 (연관 table 속성 표시할건지 등)
  ){

  }

  private async cursorPaginate<T extends BaseModel>(
    dto: PaginatePostDto,
    repository: Repository<T>, //어떤 리포지토리던 받을수있음 (postRepository, userRepository...)
    overrideFindOptions: FindManyOptions<T> = {}, //추가 옵션 (연관 table 속성 표시할건지 등)
    path : String, //url 의 path ('localhost:3000/posts 의 posts)
  ){
    /**
     * 지원할 쿼리들
     * where__likeCount__more_than
     *
     * where__title__ilike
     */
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,

    });

    //가져온 게시물의길이 === 가져와야할 게시글 -> 정상작동
    // 아닌경우 : 마지막페이지임 -> lastItem = null
    const lastItem = results.length > 0 && results.length === dto.take ? results[results.length-1] : null;

    //lastItem이 존재하는 경우에만
    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);
    if(nextUrl){
      /**
       * dto 의 키값들 돌면서 (id, order, take)
       * param 채우기
       */
      for(const key of Object.keys(dto)){
        if(dto[key]){ //값이 있는지 체크
          if(key !== 'where__id__more_than' && key !== 'where__id__less_than'){ //나머지 속성들 넣어주고
            nextUrl.searchParams.append(key, dto[key]); //order=ASC&take=20
          }
        }
      }

      let key=null;
      if(dto.order__createdAt === 'ASC'){
        key = 'where__id__more_than';
      }
      else{
        key='where__id__less_than';
      }

      //마지막으로 id 넣어주기 (req(dto)에 id 입력안한경우도 작동해야함)
      //where__id=20
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data : results,
      cursor : {
        after : lastItem?.id ?? null, //null인경우 실행안됨 예외처리!.
      },
      count : results?.length ?? 0, //null인경우 실행안됨.
      next : nextUrl?.toString() ?? null, //toString으로 객체를 str로 바꿔야 표시됨!
    }
  }

  /**
   * url 쿼리들 받아서
   * where, order, take, skip 리턴
   * @param url 쿼리
   * @return typeorm 쿼리
   */
  private composeFindOptions<T extends BaseModel>(
    dto:BasePaginatePostDto,
  ) : FindManyOptions<T>{
    /**
     * @return
     * where,
     * order,
     * take,
     * skip, (page 기반일때만)
     */

    let where : FindOptionsWhere<T> = {};
    let order : FindOptionsOrder<T> = {};

    for(const [key, value] of Object.entries(dto)){
      //key : where__id__less_than
      //vak : 25
      if(key.startsWith("where__")){
        where={
          ...where,
          ...this.parseWhereFilter(key,value),
        }
      }
      else if(key.startsWith('order__')){
        order={
          ...order,
          ...this.parseOrderFilter(key,value), //wherefilter로 바꿔도 되긴함.
        }
      }
    }
    return{
      where,
      order,
      take: dto.take,
      skip: dto.page? dto.take * (dto.page-1) : null, //스킵할페이지 계산공식
    }
  }

  /**
   *
   * @param key where__id__more_than
   * @param value 1
   * @private
   * @return where : {id : MoreThan(1)}
   */
  private parseWhereFilter<T extends BaseModel>(key:string, value:any):
    FindOptionsWhere<T> | FindOptionsOrder<T>{
    const options: FindOptionsWhere<T> = {};
    /**
     * where__id = 3
     * where__id__more_than = 1
     */
    const split = key.split('__');
    if(split.length !== 2 && split.length !== 3){
      throw new BadRequestException(
        `where 필터는 "__"로 split시 길이가 2 또는 3이어야 합니다. 
        문제되는 키값 : ${key}`
      )
    }

    /**
     * where__id = 3  이경우
     */
    if(split.length == 2){
      const [_, field] = split;
      options[field] = value; // options : { id: 3, }
    }
    /**
     * 길이가 3인경우, TypeOrm 유틸 적용필요
     * where__id__more_than = 1
     * more_than url을 typeOrm 유틸인 MoreThan으로 바꿔줘야한다.
     */
    else{
      //where, id, more_than
      const [_, field, operator] = split;
      options[field] = FILTER_MAPPER[operator](value); // options : { id : MoreThan(3) }
    }

    return options;

  }

  private parseOrderFilter<T extends BaseModel>(key:string, value:any):
    FindOptionsOrder<T>  {
    const options: FindOptionsOrder<T> = {};

    const split = key.split('__');
    if(split.length !== 2){
      throw new BadRequestException(
        `order 필터는 "__"로 split시 길이가 2여야 합니다. 
        문제되는 키값 : ${key}`
      )
    }

    /**
     * order__createdAt = ASC  이경우
     */
    const [_, field] = split;
    options[field] = value; // options : { createdAt: ASC, }


    return options;
  }
}
