import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), 
    forwardRef(() => AuthModule)
  ],
  controllers: [UserController],
  providers: [UserService, JwtAuthGuard],
  exports: [UserService]
})
export class UserModule {}
