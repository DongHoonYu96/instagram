import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor
} from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";
import { DataSource } from "typeorm";

/**
 * req에 qr을 넣어주기
 * res가 controller에 들어가기전에 startTransaction
 * 끝난후 commit, rollback
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource : DataSource,
  ) {
  }

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {

    const req = context.switchToHttp().getRequest();

    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    //이 시점에서 같은 qr을 사용해야 트랜잭션이 묶인다!! -> 즉, qr을 인자로 전달해야한다.
    await qr.startTransaction();

    req.qr = qr;

    /**
     * next.handle후에는 로직을 마친 res가 올때 실행되는 코드.
     */
    return next
      .handle()
      .pipe(
        catchError(async (e)=> {
            await qr.rollbackTransaction();
            await qr.release();

            throw new InternalServerErrorException(e.message);
          }
        ),
        tap( async() => {
            await qr.commitTransaction();
            await qr.release();
          }
        ),
      );

  }

}