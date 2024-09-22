import { BadRequestException, Module } from "@nestjs/common";
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from "@nestjs/platform-express";
import {extname} from  'path';
import * as multer from 'multer';
import { TEMP_FOLDER_PATH } from "../common/const/path.const";
import {v4 as uuid} from 'uuid';
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { ImageModel } from "./entity/image.entity";

@Module({
  imports:[
    AuthModule,
    UsersModule,
    MulterModule.register({
      limits:{
        fileSize: 10000000, //10MB 제한
      },
      fileFilter : (req, file, cb) =>  {
        /**
         * cb(error, bool)
         *
         * 에러가 있을경우 에러정보
         * 파일을 받을지 말지 bool
         */
        const ext=extname(file.originalname); //확장자 가져오기
        if(ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg'){
          return cb(
            new BadRequestException('Only jpg or png support'),
            false, //파일안받음
          );
        }

        return cb(null,true); //올바른확장자인경우, 파일받음
      },
      storage: multer.diskStorage({
        destination: function(req, file, cb){
          cb(null,TEMP_FOLDER_PATH) //에러없음, 이미지업로드할 경로
        },
        filename: (req, file, cb) => {
          // 파일이름 : uuid.png 으로 저장
          cb(null, `${uuid()}${extname(file.originalname)}`);
        }
      })
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
