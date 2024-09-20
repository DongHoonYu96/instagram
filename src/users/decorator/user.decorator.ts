import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { UsersModel } from "../entities/users.entity";

/**
 * accessTokenGuard에서 req에 넣어준 user를 검사하고
 * 리턴해주는 데코레이터
 * @param : usersModel의 key
 */
export const User = createParamDecorator((data: keyof UsersModel | undefined, context : ExecutionContext) => {
  const req = context.switchToHttp().getRequest();

  const user = req.user;

  /**
   * AccessTokenGuard 사용후 (req.user에 주입후)
   * 이걸 사용해야 user가 있음.
   * 이게 비어있다 ? -> 서버에러임 -> AccessTokenGuard를 추가하면됨
   */
  if (!user) {
    throw new InternalServerErrorException('' +
      'User 데코레이저는 AccessGuard와 함께 사용해야합나다. ' +
      'Request에 user 프로퍼티가 존재하지 않습니다!')
  }

  /**
   * @User('id')와 같이 특정 속성만 달라고 요청한경우
   */
  if(data){
    return user[data];
  }

  return user;
});