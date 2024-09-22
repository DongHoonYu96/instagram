import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "../auth/guard/bearer-token.guard";
import { UsersModel } from "../users/entities/users.entity";
import { User } from "../users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginatePostDto";
import { ImageModelType } from "../common/entity/image.entity";

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
  async postPost(
    @User('id') userId : number,
    @Body() body : CreatePostDto,
    ){

    const post = await this.postsService.createPost(userId ,body);

    /**
     * body의 image 이름들에대해
     * 각각 정보들을 넣어서 이미지를 만듬(db에 저장)
     * 주인은 post
     */
    for(let i=0;i<body.images.length;i++){
      await this.postsService.createPostImage({
        post,
        order:i,
        path:body.images[i],
        type:ImageModelType.POST_IMAGE,
      });
    }

    return this.postsService.getPostById(post.id);

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
