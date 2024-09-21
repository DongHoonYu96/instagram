import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostsModel } from "./entities/posts.entity";
import { FindOptionsWhere, LessThan, MoreThan, Repository } from "typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginatePostDto";
import { HOST, PROTOCOL } from "../common/const/env.const";
import { CommonService } from "../common/common.service";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService
  ) {
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

  //컨트롤러의 getAll에서 호출중
  async paginatePosts(dto : PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        relations: ['author'],
      },
      'posts',
    )
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
