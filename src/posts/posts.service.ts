import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostsModel } from "./entities/posts.entity";
import { MoreThan, Repository } from "typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginatePostDto";

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

    const lastItem = posts.length > 0 ? posts[posts.length-1] : null;

    return {
      data : posts,
      // cursor : {
      //   after : posts[posts.length-1].id,
      // },
      count : lastItem?.id, //null인경우 실행안됨.
      next : "",
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
