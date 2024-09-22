import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import { LogInterceptor } from "./common/interceptor/log.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true, //dto를 수정 가능하게(dto 기본값 들어가도록)
    transformOptions:{
      enableImplicitConversion: true, //Class-Validator Type에 맞게 자동형변환
    },
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalInterceptors(new LogInterceptor());

  await app.listen(3000);
}
bootstrap();
