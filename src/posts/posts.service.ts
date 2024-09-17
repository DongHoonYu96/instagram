import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostsModel } from "./entities/posts.entity";
import { Repository } from "typeorm";

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

  async createPost(authorId: number, title: string, content: string){
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      title: title,
      content: content,
      likeCount:0,
      commentCount:0,
    });

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async updatePost(postId: number, title: string, content: string) {
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
}
