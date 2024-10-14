import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import  * as dotenv from 'dotenv';
import { ErrorInterceptor } from './common/error.interceptor';
import { TransformInterceptor } from './common/transform.interceptor';

dotenv.config();

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); 
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new ErrorInterceptor());
  
  await app.listen(port, () => 
    console.log(
      `Application is running on: http://localhost:${port}`
    )
  );
}

bootstrap();
