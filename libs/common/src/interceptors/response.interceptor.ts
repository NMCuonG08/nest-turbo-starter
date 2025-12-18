import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data: any) => {
        // Nếu data đã có statusCode thì giữ nguyên (tránh double wrap)
        if (data?.statusCode !== undefined) {
          return data;
        }

        // Wrap success response với HTTP status code thực tế
        return {
          statusCode: response.statusCode || HttpStatus.OK,
          data,
        };
      }),
    );
  }
}
