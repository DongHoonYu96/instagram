import { PickType } from "@nestjs/mapped-types";
import { ImageModel } from "../../../common/entity/image.entity";

// 이미지 1개에 대한 정보
export class CreatePostImageDto extends PickType(ImageModel, ['path','post','order','type']){

}