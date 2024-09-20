import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostsModel } from "./entities/posts.entity";
import { MoreThan, Repository } from "typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginatePostDto";
import { HOST, PROTOCOL } from "../common/const/env.const";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>) {
  }

  async getAllPosts(){
    return await this.postsRepository.find({
      relations:['author'],
    });
  }


  async getPostById(id:number) {
     const post = await this.postsRepository.findOne({
      where:{
        id,
      },
       relations:['author'],
    });

     if(!post){
       throw new NotFoundException("Not Found zzz");
     }

     return post;
  }

  async createPost(authorId: number, postDto : CreatePostDto){

    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      // title: title,
      // content: content,
      ...postDto,
      likeCount:0,
      commentCount:0,
    });

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async updatePost(postId: number, updatePostDto : UpdatePostDto) {
    const {title, content} = updatePostDto;
    const post = await this.postsRepository.findOne({
      where:{
        id: postId,
      }
    });
    
    if(!post){
      throw new NotFoundException();
    }
    
    if(title){
      post.title=title;
    }
    
    if(content){
      post.content = content;
    }
    
    const newPost = await this.postsRepository.save(post);
    
    return newPost;
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({
      where:{
        id,
      }
    });

    if(!post){
      throw new NotFoundException();
    }

    await this.postsRepository.delete(id);

    return id;
  }

  async paginatePosts(dto : PaginatePostDto){
    const posts = await this.postsRepository.find({
      where:{
        id: MoreThan(dto.where__id_more_than ?? 0), //없으면 기본값 0으로!
      },
      order:{
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    /**
     * Response
     *
     * data : Data[],
     * cursor : {
     *  after: 마지막 Data의 ID
     * }
     * count : 응답한 데이터의 갯수
     * next : 다음 요청을 할때 사용할 URL
     */

    //가져온 게시물의길이 === 가져와야할 게시글 -> 정상작동
    // 아닌경우 : 마지막페이지임 -> lastItem = null
    const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length-1] : null;

    //lastItem이 존재하는 경우에만
    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);
    if(nextUrl){
      /**
       * dto 의 키값들 돌면서 (id, order, take)
       * param 채우기
       */
      for(const key of Object.keys(dto)){
        if(dto[key]){ //값이 있는지 체크
          if(key !== 'where__id__more_than'){ //나머지 속성들 넣어주고
            nextUrl.searchParams.append(key, dto[key]); //order=ASC&take=20
          }
        }
      }
      //마지막으로 id 넣어주기 (req(dto)에 id 입력안한경우도 작동해야함)
      //where__id=20
      nextUrl.searchParams.append('where__id__more_than', lastItem.id.toString());
    }

    return {
      data : posts,
      cursor : {
        after : lastItem?.id ?? null, //null인경우 실행안됨 예외처리!.
      },
      count : posts.length, //null인경우 실행안됨.
      next : nextUrl?.toString() ?? null, //toString으로 객체를 str로 바꿔야 표시됨!
    }
  }

  async generatePosts(userId : number){
    for(let i=0;i<100;++i){
      await this.createPost(userId, {
        title : `임의로 생성된 제목 ${i}`,
        content : `임의로 생성된 내용 ${i}`,
      })
    }
  }
}
