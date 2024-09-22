import { BaseModel } from "./base.entity";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Column, ManyToOne } from "typeorm";
import { Transform } from "class-transformer";
import { join } from "path";
import { POST_PUBLIC_IMAGE_PATH } from "../const/path.const";
import { PostsModel } from "../../posts/entities/posts.entity";

export enum ImageModelType{
  POST_IMAGE,
}

export class ImageModel extends BaseModel{
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number; //이미지 보여줄 순서

  // usersMode -> 사용자 프로필 이미지
  // postModel -> 포스트 이미지
  @Column({
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({value, obj}) => { //value == img이름
    if(value && obj.type === ImageModelType.POST_IMAGE){
      return `/${join(
        POST_PUBLIC_IMAGE_PATH,
        value,
      )}`
    }
    else{
      return value;
    }
  })
  path: String;

  // @ManyToOne((type) => PostsModel, (post) => post.images)
  // post?: PostsModel;

}