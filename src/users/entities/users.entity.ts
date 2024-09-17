import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "../const/roles.const";

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 길이가 20 이하
   * 유니크 값
   */
  @Column({
    length: 20,
    unique: true,
  })
  nickname: string;

  /**
   * 유니크 값
   */
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(RolesEnum), //객체의 값들을 가져옴
    default: RolesEnum.USER, //기본값
  })
  role: RolesEnum;
}
