import { ValidationArguments } from "class-validator";

export const lengthValidationMessage = (args: ValidationArguments) => {
  /**
   * ValidationArguments의 속성들
   *
   * 1) value == 검증되고 있는 값 (입력된 값)
   * 2) constraints -> 파라미터의 제한사항들
   *      @Length(2, 20)
   *      args.constraints[0] == 2
   *      args.constraints[1] == 20
   * 3) targetName == 검증하고 있는 클래스의 이름
   * 4) object == 검증하고있는객체
   * 5) property == 검증되고있는 객체의 속성 이름 (ex : nickname)
   */

  // min, max 가 모두 있는경우
  if(args.constraints.length == 2){
    return `${args.property}은(는) ${args.constraints[0]} ~ ${args.constraints[1]} 글자를 입력해주세요.`;
  }
  else{ // min만 준 경우
    return `${args.property}은(는) ${args.constraints[0]} 이상 글자를 입력해주세요.`;
  }
}