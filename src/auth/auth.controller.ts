import { Controller, Post, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Req() req: Request) {
    const { username, password } = req.body;
    try {
      const token = await this.authService.validateUser(username, password);

      if (!token) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      req.res.cookie('auth_token', token.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
  
      return {
        statusCode: 201,
        message: 'Login successful',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message)
    }

  }

  @Delete('logout')
  async logout(@Req() req: Request) {
    req.res.clearCookie('auth_token');
    return {
      statusCode: 201,
      message: 'Logout successful',
    };
  }
}
