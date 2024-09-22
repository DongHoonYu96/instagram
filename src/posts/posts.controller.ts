import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards, UseInterceptors
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "../auth/guard/bearer-token.guard";
import { UsersModel } from "../users/entities/users.entity";
import { User } from "../users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginatePostDto";
import { ImageModelType } from "../common/entity/image.entity";
import { DataSource, QueryRunner as QR } from "typeorm";
import { PostsImagesService } from "./image/images.service";
import { TransactionInterceptor } from "../common/interceptor/transaction.interceptor";
import { QueryRunner } from "../common/decorator/querry-runner.decorator";

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
     ) {}

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
  @UseInterceptors(TransactionInterceptor)
  async postPost(
    @User('id') userId : number,
    @Body() body : CreatePostDto,
    @QueryRunner() qr: QR, //req에서 qr만 파싱해옴.
    ){

    //로직실행
    const post = await this.postsService.createPost(userId ,body, qr);

    /**
     * body의 image 이름들에대해
     * 각각 정보들을 넣어서 이미지를 만듬(db에 저장)
     * 주인은 post
     */
    for(let i=0;i<body.images.length;i++){
      await this.postsImagesService.createPostImage({
        post,
        order:i,
        path:body.images[i],
        type:ImageModelType.POST_IMAGE,
      }, qr);
    }

    return this.postsService.getPostById(post.id, qr);

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
