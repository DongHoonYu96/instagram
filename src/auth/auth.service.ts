import { Injectable } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
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
   * Payload에 들어갈 정보
   *
   * 1) email
   * 2) sub == 사용자의 id
   * 3) type : access토큰인지, refresh 토큰인지
   */
  signToken(){

  }
}
