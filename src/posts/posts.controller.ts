import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Request,
  Query
} from "@nestjs/common";
import { PostsService } from './posts.service';
import { AccessTokenGuard } from "../auth/guard/bearer-token.guard";
import { UsersModel } from "../users/entities/users.entity";
import { User } from "../users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginatePostDto";
import { UsersModule } from "../users/users.module";

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts(
    @Query() query : PaginatePostDto
  ){
    return this.postsService.paginatePosts(query);
  }

  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id:number){
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  createPost(
    @User('id') userId : number,
    @Body() body : CreatePostDto){
    return this.postsService.createPost(userId ,body);
  }

  @Patch(':id')
  updatePost(
    @Param('id' , ParseIntPipe) id:number,
    @Body() updatePostDto : UpdatePostDto){
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  deletePost(@Param('id' , ParseIntPipe) id:number){
    return this.postsService.deletePost(id);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User() user: UsersModel){
    await this.postsService.generatePosts(user.id);

    return true;
  }
}
