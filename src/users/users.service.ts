import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersModel } from "./entities/users.entity";
import { Repository } from "typeorm";
import { UsersModule } from "./users.module";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository : Repository<UsersModel>,
  ) { }

  async getAllUsers() {
    return await this.usersRepository.find();
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where:{
        id,
      },
    });

    if(!user){
      throw new NotFoundException("Not Found zzz");
    }

    return user;
  }

  async createUser(user: Pick<UsersModel, 'email'|'nickname'|'password'>) {
    /**
     * 중복확인
     */
    const nicknameExists = await this.usersRepository.exists({
      where: {
        nickname: user.nickname,
      }
    });
    if(nicknameExists){
      throw new BadRequestException('이미 존재하는 nickname 입니다.');
    }

    const emailExists = await this.usersRepository.exists({
      where: {
        email: user.email,
      }
    });
    if(emailExists){
      throw new BadRequestException('이미 존재하는 email 입니다.');
    }




    const userObj = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObj);
    return newUser;
  }

  async deleteUser(id: number) {
    const user = await this.usersRepository.findOne({
      where:{
        id,
      }
    });

    if(!user){
      throw new NotFoundException();
    }

    await this.usersRepository.delete(id);

    return id;
  }

  async updateUser(id:number, nickname:string, email:string, password:string) {
    const user = await this.usersRepository.findOne({
      where:{
        id,
      }
    });

    if(!user){
      throw new NotFoundException();
    }

    if(nickname){
      user.nickname = nickname;
    }

    if(email){
      user.email=email;
    }

    if(password){
      user.password = password;
    }

    const newUser = await this.usersRepository.save(user);

    return newUser;
  }

  async getUserByEmail(email: string){
    return await this.usersRepository.findOne({
      where:{
        email,
      }
    })
  }
}
