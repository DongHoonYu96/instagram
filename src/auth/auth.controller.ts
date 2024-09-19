import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { PasswordPipe } from "./pipe/password.pipe";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  /**
   * Header중 authorization 필드만 가져옴
   */
  @Post('/login/email')
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
