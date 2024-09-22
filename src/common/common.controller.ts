import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CommonService } from './common.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { AccessTokenGuard } from "../auth/guard/bearer-token.guard";

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image')) //image key를 받아옴
  @UseGuards(AccessTokenGuard)
  postImage(
    @UploadedFile() file){ //업로드된 file 받아옴
    return{
      fileName: file.filename, //만든 파일이름만 리턴하는 api
    }
  }
}
