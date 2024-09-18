import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersModel } from "./entities/users.entity";
import { Repository } from "typeorm";

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

  async createUser(nickname: string, email: string, password: string) {
    const user = this.usersRepository.create({
      nickname: nickname,
      email: email,
      password: password,
    });

    const newUser = await this.usersRepository.save(user);
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
