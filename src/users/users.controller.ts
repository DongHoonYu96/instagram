import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllPosts(){
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  getPostById(@Param('id') id:number){
    return this.usersService.getUserById(id);
  }

  // @Post()
  // createPost(@Body('nickname') nickname: string,
  //   @Body('email') email: string,
  //   @Body('password') password: string){
  //     return this.usersService.createUser({nickname, email, password});
  // }

  @Patch(':id')
  updatePost(@Param('id') id:number,
             @Body('nickname') nickname: string,
             @Body('email') email: string,
             @Body('password') password: string){
    return this.usersService.updateUser(id, nickname, email, password);
  }

  @Delete(':id')
  deletePost(@Param('id') id:number){
    return this.usersService.deleteUser(id);
  }
}
