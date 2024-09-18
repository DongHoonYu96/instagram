import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsModule } from './posts/posts.module';
import { PostsModel } from "./posts/entities/posts.entity";
import { UsersModel } from "./users/entities/users.entity";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    PostsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [PostsModel,UsersModel], //생성할 모델들
      synchronize: true, //typeorm 코드와 db싱크를 맞출건지 (개발에서만 써라)
      logging: true, // 모든 쿼리 로깅
      logger: 'advanced-console',
    }),
    AuthModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
