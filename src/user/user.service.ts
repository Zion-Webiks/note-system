import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async createUser(username: string, password: string, email: string): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new this.userModel({ username, password: hashedPassword, email });
      return await newUser.save();
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create user');
    }
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password').exec();  // Exclude password
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
