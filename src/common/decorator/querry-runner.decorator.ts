import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

/**
 *  req에 넣어준 qr을 검사하고
 *  qr을 리턴해주는 데코레이터
 */
export const QueryRunner = createParamDecorator((data, context : ExecutionContext) => {
  const req = context.switchToHttp().getRequest();

  //FE와 BE의 평화가 찾아옴.
  if (!req.qr) {
    throw new InternalServerErrorException('' +
      'QueryRunner 데코레이저는 Transactional Interceptor 와 함께 사용해야합나다. ');
  }

  return req.qr;
});