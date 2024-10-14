import { Controller, Post, Get, UseGuards, Res, Body, UsePipes, Req, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Response } from 'express';
import { CreateUserDto } from '../common/create-user.dto';
import { GenericValidationPipe } from '../common/validation.pipe';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService
  ) {}

  @Post('register')
  @UsePipes(GenericValidationPipe)
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.createUser(
        createUserDto.username, 
        createUserDto.password, 
        createUserDto.email
      );
      
      return {
        message: 'User registered successfully',
        user,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const userId = (req as any).user.sub;  

    try {
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return {
        message: 'User profile retrieved successfully',
        user,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
