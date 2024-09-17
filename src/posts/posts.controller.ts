import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts(){
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  getPostById(@Param('id') id:number){
    return this.postsService.getPostById(id);
  }

  @Post()
  createPost(@Body() postData: { author: string; title: string; content:string; }){
    return this.postsService.createPost(postData.author, postData.title, postData.content);
  }

  @Patch(':id')
  updatePost(@Param('id') id:number,  @Body() postData: { author: string; title: string; content:string; }){
    return this.postsService.updatePost(id, postData.author, postData.title, postData.content);
  }

  @Delete(':id')
  deletePost(@Param('id') id:number){
    return this.postsService.deletePost(id);
  }

}
