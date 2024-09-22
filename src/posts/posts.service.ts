import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostsModel } from "./entities/posts.entity";
import { FindOptionsWhere, LessThan, MoreThan, QueryRunner, Repository } from "typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginatePostDto";
import { CommonService } from "../common/common.service";
import { join, basename } from "path";
import { POST_IMAGE_PATH, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH } from "../common/const/path.const";
import {promises} from 'fs';
import { CreatePostImageDto } from "./image/dto/create-image.dto";
import { ImageModel } from "../common/entity/image.entity";
import { DEFAULT_POST_FIND_OPTIONS } from "./const/default-post-find-options.const";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,

    @InjectRepository(ImageModel)
    private readonly imageRepository : Repository<ImageModel>,

    private readonly commonService: CommonService,

  ) {
  }

  async getAllPosts(){
    return await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
    });
  }


  async getPostById(id:number) {
     const post = await this.postsRepository.findOne({
      where:{
        id,
      },
       ...DEFAULT_POST_FIND_OPTIONS,
    });

     if(!post){
       throw new NotFoundException("Not Found zzz");
     }

     return post;
  }

  /**
   * @param qr
   * qr이 있으면 트랜잭션으로 묶여야함 -> qr의 repository 반환
   * 아니면, 그냥 리포지토리 반환
   */
  getRepository(qr? : QueryRunner){
    return qr? qr.manager.getRepository<PostsModel>(PostsModel) : this.postsRepository;
  }

  async createPost(authorId: number, postDto : CreatePostDto, qr?: QueryRunner){

    const repository = this.getRepository(qr);

    const post = repository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      images: [],
      likeCount:0,
      commentCount:0,
    });

    const newPost = await repository.save(post);
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

  //컨트롤러의 getAll에서 호출중
  async paginatePosts(dto : PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        ...DEFAULT_POST_FIND_OPTIONS,
      },
      'posts',
    )
  }

  async generatePosts(userId : number){
    for(let i=0;i<100;++i){
      await this.createPost(userId, {
        title : `임의로 생성된 제목 ${i}`,
        content : `임의로 생성된 내용 ${i}`,
        images:[],
      })
    }
  }



}
