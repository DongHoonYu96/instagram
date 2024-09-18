import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersModel } from "../users/entities/users.entity";
import { JWT_SECRET } from "./const/auth.const";
import { UsersService } from "../users/users.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * 1) register with email
   *    - email, nickname, password 입력받고 사용자 생성
   *    - 완료되면, accessToken과 refreshToken을 반환
   *      => 회원가입 후 다시 로그인 방지
   *
   * 2) loginWithEmail
   *    - email, password를 입력하면 사용자 검증을 진행한다.
   *    - 검증이 완료되면 accessToken과 refreshToken을 반환한다
   *
   * 3) loginUser
   *    - (1)과 (2)에서 필요한 acessToken, refreshToken을 반환
   *
   * 4) signToken
   *    - (3)에서 필요한 토큰들 sign
   *
   * 5) authenticateWithEmailAndPassword
   *    - (2)에서 로그인을 진행할때 필요한 기본적인 검증 진행
   *      1. 사용자가 존재하는지 확인 (email)
   *      2. 비밀번호가 맞는지 확인
   *      3. 모두 통과되면 찾은 사용자 정보 반환
   *      4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
   */

  /**
   * Payload(실제 데이터)에 들어갈 정보
   *
   * 1) email
   * 2) sub == 사용자의 id
   * 3) type : access토큰인지, refresh 토큰인지
   *
   * Pick문법 : 가독성이 좋음 // email:string, id: string과 기능은 동일
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean){
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken? 3600 : 300,
    });
  }

  async loginUser(user: Pick<UsersModel, 'email' | 'id'>){
    return{
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    }
  }


  // 1. 사용자가 존재하는지 확인 (email)
  // 2. 비밀번호가 맞는지 확인
  // 3. 모두 통과되면 찾은 사용자 정보 반환
  // 4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
  async authenticationWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>){
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if(!existingUser){
      throw new UnauthorizedException('존재하지 않는 사용자 입니다.');
    }

    const passOk = bcrypt.compare(user.password, existingUser.password);

    if(!passOk){
      throw new UnauthorizedException('비밀번호가 틀렸어요.');
    }

    return existingUser;
  }
}
