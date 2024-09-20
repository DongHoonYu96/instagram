import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UsersModel } from "../../users/entities/users.entity";
import { BaseModel } from "../../common/entity/base.entity";
import { IsString, Length } from "class-validator";
import { lengthValidationMessage } from "../../common/validation-message/length-validation.message";

@Entity() //테이블생성해줘
export class PostsModel extends BaseModel{

  /**
   * 게시글은 1명의 사용자를 가진다.
   * 사용자는 게시글 여러개를 가진다.
   * users 모델에서 posts모델을 표현하는 속성이 posts다.
   */
  @ManyToOne(()=>UsersModel, (user)=> user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString()
  @Length(2,20, {
    message : lengthValidationMessage,
  })
  title: string;

  @Column()
  @IsString()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
