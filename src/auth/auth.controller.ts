import { Body, Controller, Get, Headers, Post, UseGuards } from "@nestjs/common";
import { AuthService } from './auth.service';
import { PasswordPipe } from "./pipe/password.pipe";
import { BasicTokenGuard } from "./guard/basic-token.guard";
import { AccessTokenGuard, RefreshTokenGuard } from "./guard/bearer-token.guard";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  /**
   * Header중 authorization 필드만 가져옴
   */
  @Post('/login/email')
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
    @Headers('authorization') rawToken: string,){
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credentials = this.authService.decodeBasicToken(token); // {email, password} 객체

    return this.authService.loginWithEmail(credentials);
  }

  @Post('/register/email')
  postRegisterEmail(
    @Body('nickname')nickname :string,
    @Body('email')email :string,
    @Body('password', PasswordPipe)password : string,){
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });
  }

  @Post('token/access')
  @UseGuards(RefreshTokenGuard) //리프레시 토큰으로만 엑세스토큰 발급가능
  postTokenAccess(
    @Headers('authorization') rawToken: string,){
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token,false);

    /**
     * {accessToken : {token}}
     */
    return {
      accessToken: newToken,
    }

  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(
    @Headers('authorization') rawToken: string,){
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token,true);

    /**
     * {refreshToken : {token}}
     */
    return {
      refreshToken: newToken,
    }

  }
}
