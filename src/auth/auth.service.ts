import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersModel } from "../users/entities/users.entity";
import { HASH_ROUNDS, JWT_SECRET } from "./const/auth.const";
import { UsersService } from "../users/users.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 토큰인증
   *
   * 1) 사용자가 로그인 또는 화원가입을하면, 토큰 발급받는다.
   *
   * 2) 로그인 할때는 Basic 토큰과 함께 요청을보낸다.
   *    Basic 토큰 : '이메일:비밀번호'를 Base64로 인코딩한 결과
   *    ex) {authorization : 'Basic {token}' }
   *
   * 3) 아무나 접근 할 수 없는 정보 (private router)를 접근할때는
   *    access토큰을 헤더에 추가해서 요청과함께 보낸다.
   *    ex) {authorization: 'Bearer {token}'}
   *
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸
   *    사용자가 누구인지 알 수 있다.
   *    ex) 토큰의 sub(id) => 해당 사용자의 post filter
   *
   * 5) 만료시간이 지나면 새 토큰을 받아야한다.
   *    그렇지 않으면 jwtService.verify() 통과가 안됨.
   *    -> /auth/token/access => access 토큰 새로발급
   *    -> /auth/token/refresh => refresh 토큰 새로발급
   *
   * 6) 토큰이 만려되면 각각의 토큰을 새로 발급 받은 수 있는 엔드포인트에 요청을 해서
   *    새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route에 접근한다.
   */

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

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if(!passOk){
      throw new UnauthorizedException('비밀번호가 틀렸어요.');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticationWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: Pick<UsersModel, 'nickname'| 'email'| 'password'>){
    const hash = await bcrypt.hash( //salt는 자동생성됨
      user.password,
      HASH_ROUNDS,
    )

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }

  /**
   * Bearer {bdfbdbdfbdbfdbcvbr43} 파싱해서 리턴
   */
  extractTokenFromHeader(header:string, isBearer: boolean){
    const splitToken = header.split(' ');

    const prefix = isBearer?  'Bearer' : 'Basic';

    if(splitToken.length!==2 || splitToken[0] !== prefix){
      throw new UnauthorizedException('잘못된 토큰입니다');
    }

    const token = splitToken[1];

    return token;
  }

  /**
   * Basic bd;fbdbdfbdbfdbcvbr43 -> email:password
   * return [email, password]
   */
  decodeBasicToken(base64String:string,){
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');
    const splitToken = decoded.split(':');

    if(splitToken.length!==2 ){
      throw new UnauthorizedException('잘못된 토큰입니다');
    }

    const [email, password] = splitToken;

    return{
      email,
      password,
    }

  }

  /**
   * 토큰 검증
   * @param token
   */
   verifyToken(token: string){
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
   }

  /**
   * refresh 토큰 => access 토큰 재발급
   * @param token
   */
  rotateToken(token: string, isRefreshToken: boolean){
     const decoded = this.jwtService.verify(token,{
       secret:JWT_SECRET,
     });

    /**
     * sub : id
     * email
     * type : access | refresh
     */
    if(decoded.type !== 'refresh'){
       throw new UnauthorizedException('토큰 재발급은 Refresh 토큰으로만 가능합니다!')
     }

    return this.signToken({
      ...decoded,
    }, isRefreshToken);
   }
}
