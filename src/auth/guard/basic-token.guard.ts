import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";

/**
 * req.header.authorization 의 토큰으로
 * user를 가와서
 * req.user에 넣는 가드
 */
@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {} //런타임에서 DI에서 주입해줌

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // {authorization : Basic fibntbdffg}
    // fibntbdffg
    const rawToken = req.headers['authorization'];

    if(!rawToken){
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    const token = this.authService.extractTokenFromHeader(rawToken,false);

    const {email, password} = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticationWithEmailAndPassword({
      email,
      password,
    });

    req.user = user;

    return true; //가드 통과
  }
}