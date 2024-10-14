import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request) => request?.cookies?.auth_token]),  // Extract from cookie
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, 
    });
  }

  // Use JwtPayload as the type for the payload
  async validate(payload: JwtPayload) {
    const { sub } = payload;  // The user ID is in the "sub" field
    const user = await this.userService.findUserById(sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;  // Attach the user object to req.user
  }
}


