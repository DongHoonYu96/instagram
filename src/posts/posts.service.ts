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
    return await this.postsRepository.find();
  }


  async getPostById(id:number) {
     const post = await this.postsRepository.findOne({
      where:{
        id,
      },
    });

     if(!post){
       throw new NotFoundException("Not Found zzz");
     }

     return post;
  }


  }
}
