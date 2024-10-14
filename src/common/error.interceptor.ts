import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    HttpException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  
  @Injectable()
  export class ErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        catchError((err) => {
          if (err instanceof HttpException) {
            // If the error is an HttpException, return the original error
            return throwError(() => err);
          } else {
            // If it's not an HttpException, return a 500 Internal Server Error
            return throwError(() => new InternalServerErrorException('An unexpected error occurred'));
          }
        }),
      );
    }
  }
  