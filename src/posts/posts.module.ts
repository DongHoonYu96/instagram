import { BadRequestException, Module } from "@nestjs/common";
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsModel } from "./entities/posts.entity";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { CommonModule } from "../common/common.module";
import { ImageModel } from "../common/entity/image.entity";
import { PostsImagesService } from "./image/images.service";

@Module({
  imports:[
    TypeOrmModule.forFeature([
      PostsModel,
      ImageModel, //Repository만 import할때는 여기!
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
})
export class PostsModule {}
