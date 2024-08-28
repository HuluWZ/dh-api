import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
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
  @ApiResponse({
    status: 200,
    description: 'OTP verified and token issued',
    type: Object,
  })
  @ApiResponse({ status: 401, description: 'Invalid OTP or inactive account' })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<{ accessToken: string; isActive: boolean }> {
    try {
      const result = await this.authService.verifyOtp(verifyOtpDto);
      return {
        accessToken: result.accessToken,
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: CompleteProfileDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async completeProfile(
    @Body() completeProfileDto: CompleteProfileDto,
  ): Promise<{ message: string; user: User }> {
    try {
      const updatedUser =
        await this.authService.completeProfile(completeProfileDto);
      return { message: 'Profile updated successfully', user: updatedUser };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
