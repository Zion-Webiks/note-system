import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['auth_token'];  
    console.log(token);

    if (!token) {
      throw new UnauthorizedException('No token found in cookies');
    }

    try {
      const decoded = this.jwtService.verify(token);
      console.log(decoded);
      (request as any).user = decoded; 
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
