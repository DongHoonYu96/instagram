import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsModule } from './posts/posts.module';
import { PostsModel } from "./posts/entities/posts.entity";
import { UsersModel } from "./users/entities/users.entity";
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY
} from "./common/const/env-keys.const";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PUBLIC_FOLDER_PATH } from "./common/const/path.const";
import { ImageModel } from "./common/entity/image.entity";

@Module({
  imports: [
    UsersModule,
    PostsModule,
    ServeStaticModule.forRoot({
      //이 경로에 있는 이미지들을 제공해줄것임.
      rootPath: PUBLIC_FOLDER_PATH, //public 폴더의 절대경로 : D:nest/insta/public
      //문제 : root인 public폴더는 제외된채로 외부에 전달됨 -> 기존의 컨트롤러 url과 겹침 (/posts/4022.jpg)
      //해결 : serveRoot 추가(/public/posts/4022.jpg)

      serveRoot: '/public',
    }),
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true, //모든서비스에 자동 import
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV_DB_HOST_KEY],
      port: +process.env[ENV_DB_PORT_KEY],
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      entities: [
        PostsModel,
        UsersModel,
        ImageModel,
      ], //생성할 모델들
      synchronize: true, //typeorm 코드와 db싱크를 맞출건지 (개발에서만 써라)
      logging: true, // 모든 쿼리 로깅
      logger: 'advanced-console',
    }),
    AuthModule,
    CommonModule,

  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide:APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    }
  ],
})
export class AppModule {}
