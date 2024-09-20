import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, Request } from "@nestjs/common";
import { PostsService } from './posts.service';
import { AccessTokenGuard } from "../auth/guard/bearer-token.guard";

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts(){
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id:number){
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  createPost(
    @Request() req : any,
    @Body('title') title: string,
    @Body('content') content:string, ){
    return this.postsService.createPost(req.user.id , title, content);
  }

  @Patch(':id')
  updatePost(@Param('id' , ParseIntPipe) id:number,  @Body() postData: { title: string; content:string; }){
    return this.postsService.updatePost(id,  postData.title, postData.content);
  }

  @Delete(':id')
  deletePost(@Param('id' , ParseIntPipe) id:number){
    return this.postsService.deletePost(id);
  }

}
