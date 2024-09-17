import { Controller, Get, Param, Post } from "@nestjs/common";
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts(){
    return this.postsService.getAllPosts();
  }

  @Get(':/id')
  getPostById(@Param('id') id:number){
    return this.postsService.getPostById(id);
  }

  @Post()
  createPost(){
    return this.postsService.createPost();
  }

}
