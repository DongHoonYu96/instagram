import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageModel } from "../../common/entity/image.entity";
import { QueryRunner, Repository } from "typeorm";
import { CreatePostImageDto } from "./dto/create-image.dto";
import { basename, join } from "path";
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from "../../common/const/path.const";
import { promises } from "fs";

@Injectable()
export class PostsImagesService{
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository : Repository<ImageModel>,
  ) {
  }

  getRepository(qr? : QueryRunner){
    return qr? qr.manager.getRepository<ImageModel>(ImageModel) : this.imageRepository;
  }

  /**
   * dto의 이미지 이름을 기반으로
   * 파일의 경로 생성
   * @param dto
   */
  async createPostImage(dto : CreatePostImageDto, qr: QueryRunner){
    const repository = this.getRepository(qr);

    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try{
      await promises.access(tempFilePath); //존재확인,
    }
    catch(error){
      throw new BadRequestException('존재하지 않는 파일 입니다.' + error);
    }

    //파일 이름만 가져오기
    //public/temp/aaa.jpg -> aaa.jpg
    const fileName= basename(tempFilePath);

    const newPath = join(POST_IMAGE_PATH, fileName);

    //옮기기전에 save (rollback대비)
    const result = await repository.save({
      ...dto,
    });

    // 1->2로 파일 옮김.
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}