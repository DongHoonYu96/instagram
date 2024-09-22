import { PickType } from "@nestjs/mapped-types";
import { PostsModel } from "../entities/posts.entity";
import { IsOptional, IsString } from "class-validator";

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']){

  @IsString({
    each:true, //배열의 모든 요소 검증
  })
  @IsOptional()
  images?: string[] = [];

}