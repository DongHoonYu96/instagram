import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any): any {
    if(value.toString().length < 8){
      throw new BadRequestException('비밀번호는 8자 이상이어야 합니다.');
    }
    if(value.toString().length > 20){
      throw new BadRequestException('비밀번호는 20자 이하여야 합니다.');
    }
    return value.toString();
  }
}