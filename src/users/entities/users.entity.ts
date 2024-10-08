import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { PostsModel } from "../../posts/entities/posts.entity";
import { BaseModel } from "../../common/entity/base.entity";
import { IsEmail, IsString, Length } from "class-validator";
import { emailValidationMessage } from "../../common/validation-message/email-validation.message";
import { lengthValidationMessage } from "../../common/validation-message/length-validation.message";
import e from "express";
import { Exclude } from "class-transformer";

@Entity()
export class UsersModel extends BaseModel{

  /**
   * 길이가 20 이하
   * 유니크 값
   */
  @Column({
    length: 20,
    unique: true,
  })
  @IsString()
  @Length(1,20, {
    message : lengthValidationMessage,
  })
  nickname: string;

  /**
   * 유니크 값
   */
  @Column({
    unique: true,
  })
  @IsEmail({}, {
    message : emailValidationMessage,
  })
  @IsString()
  email: string;

  @Column()
  @IsString()
  @Length(3,20, {
    message : lengthValidationMessage,
  })
  /**
   * REQ
   * fe -> be
   * plain obj (JSON) -> class instance (DTO)
   * 
   * RES
   * be -> fe
   * class instance(DTO) -> plain obj (JSON)
   * 
   * toClassOnly -> REQ에만 적용
   * toPlainOnly -> RES에만 적용
   */
  @Exclude({
    toPlainOnly:true, //RES에 비밀번호 제외
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum), //객체의 값들을 가져와서 배열로 만듬
    default: RolesEnum.USER, //기본값
  })
  role: RolesEnum; //

  /**
   * 사용자는 여러개의 post를 가진다.
   * (연동할모델, 반환 모델)
   * 포스트모델의 어떤 속성하고 연동인지? post.author
   */
  @OneToMany(()=> PostsModel, (post) => post.author)
  posts : PostsModel[];
}
