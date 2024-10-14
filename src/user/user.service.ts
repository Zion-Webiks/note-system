import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  // Create a new user
  async createUser(username: string, password: string, email: string): Promise<User> {
    try {
      // Check if the username or email already exists
      const existingUser = await this.userModel.findOne({
        $or: [{ username }, { email }]
      }).exec();

      if (existingUser) {
        if (existingUser.username === username) {
          throw new ConflictException('Username is already taken');
        } else {
          throw new ConflictException('Email is already taken');
        }
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = new this.userModel({ username, password: hashedPassword, email });
      return await newUser.save();
    } catch (error) {
      // Handle any unforeseen errors during user creation
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
