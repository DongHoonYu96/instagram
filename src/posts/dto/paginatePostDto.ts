import { IsIn, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class PaginatePostDto {

  /**
   * 이전 마지막 데이터의 ID
   * 이것 이후로 데이터를 가져와야함
   * ASC와 짝궁(같이 사용해야함)
   */
  @IsNumber()
  @IsOptional()
  where__id_more_than?:number;

  /**
   * DESC와 짝궁
   */
  @IsNumber()
  @IsOptional()
  where__id_less_than?:number;

  @IsIn(['ASC', 'DESC']) //값제한
  @IsOptional()
  order__createdAt?: 'ASC' = 'ASC' ; //기본값은 ASC

  /**
   * 몇개의 데이터를 가져올건지
   */
  @IsNumber()
  @IsOptional()
  take: number=20;
}