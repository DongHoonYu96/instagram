import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "../../users/users.service";

/**
 * Bearer sdfjdsivjlivjdlfiv 토큰을 받아서
 * 파싱후
 * req에 user, token, tokenType 넣기
 */
@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService,
              private readonly usersService : UsersService) {} //런타임에서 DI에서 주입해줌

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // {authorization : Basic fibntbdffg}
    // fibntbdffg
    const rawToken = req.headers.authorization;

    if(!rawToken){
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    // fibntbdffg
    const token = this.authService.extractTokenFromHeader(rawToken,true);

    // 토큰 분석후
    // email, sub, type, iat, exp 리턴
    const result = await this.authService.verifyToken(token);

    /**
     * req에 넣을정보
     * 1) 서용자 정보
     * 2) token
     * 3) token type - access | refresh
     */

    const user = await this.usersService.getUserByEmail(result.email);

    req.user = user;
    req.token = token;
    req.tokenType = result.type;

    return true; //가드 통과
  }
}

/**
 * 토큰이 엑세스 토큰인지 확인
 */
@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    if(req.tokenType !== 'access'){
      throw new UnauthorizedException('Access Token이 아닙니다.');
    }

    return true; //다음 미들웨어로
  }
}

/**
 * 토큰이 refresh 토큰인지 확인
 */
@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    if(req.tokenType !== 'refresh'){
      throw new UnauthorizedException('Refresh Token이 아닙니다.');
    }

    return true; //다음 미들웨어로
  }
}