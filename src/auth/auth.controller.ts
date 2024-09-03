import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { formatPhone } from 'phone-formater-eth';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone number' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    try {
      await this.authService.sendOtp(sendOtpDto);
      return { message: 'OTP sent successfully' };
    } catch {
      throw new BadRequestException('Invalid phone number');
    }
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get access token' })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<{ accessToken: string; user: User; isActive: boolean }> {
    try {
      const result = await this.authService.verifyOtp(verifyOtpDto);
      return {
        accessToken: result.accessToken,
        user: result.user,
        isActive: result.isActive,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid OTP or inactive account');
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post('complete-profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Complete user profile' })
  @ApiBearerAuth()
  async completeProfile(
    @Req() request,
    @Body() completeProfileDto: CompleteProfileDto,
  ): Promise<{ message: string; user: User }> {
    try {
      const id = request.user.id;
      const updatedUser = await this.authService.completeProfile(
        id,
        completeProfileDto,
      );
      return { message: 'Profile updated successfully', user: updatedUser };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers(): Promise<User[]> {
    return this.authService.getAllUsers();
  }
  @Get('user/:phone')
  @ApiOperation({ summary: 'Get user by phone number' })
  async getUserByPhone(@Param('phone') phone: string): Promise<User> {
    try {
      const formattedPhone = formatPhone(phone);
      if (formattedPhone === 'INVALID_PHONE_NUMBER') {
        throw new Error(`Invalid phone number : ${phone}`);
      }

      return this.authService.getUserByPhone(phone);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  @Get('get/me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get My profile' })
  @ApiBearerAuth()
  async getMe(@Req() request): Promise<{ user: User }> {
    try {
      const id = request.user.id;
      const updatedUser = await this.authService.getMe(id);
      return { user: updatedUser };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
