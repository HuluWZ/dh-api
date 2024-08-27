import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp/otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { formatPhone } from 'phone-formater-eth';
import { JwtService } from '@nestjs/jwt';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    @Inject(forwardRef(() => JwtService))
    private readonly authJwtService: JwtService,
    @Inject(forwardRef(() => JwtService))
    private readonly refreshJwtService: JwtService,
  ) {}
  async sendOtp(sendOtpDto: SendOtpDto): Promise<void> {
    const formattedPhone = formatPhone(sendOtpDto.phone);
    if (formattedPhone === 'INVALID_PHONE_NUMBER') {
      throw new Error(`Invalid phone number : ${sendOtpDto.phone}`);
    }

    await this.otpService.sendOtp(formattedPhone);
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ accessToken: string; isActive: boolean }> {
    const formattedPhone = formatPhone(verifyOtpDto.phone);
    const user = await this.prisma.user.findUnique({
      where: { phone: formattedPhone },
    });

    if (!user) {
      // If the user doesn't exist, redirect to profile completion
      throw new NotFoundException('User not found');
    }
    console.log({ verifyOtpDto, user });
    const verifyUser = await this.otpService.verifyOtp(
      formattedPhone,
      verifyOtpDto.otpCode,
    );
    if (!verifyUser.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Generate JWT token with phone and id as payload
    const payload = { phone: verifyUser.phone, user_id: verifyUser.id };
    const accessToken = this.authJwtService.sign(payload);

    return { accessToken, isActive: true };
  }

  async completeProfile(completeProfileDto: CompleteProfileDto): Promise<User> {
    const { phone, firstName, lastName, email } = completeProfileDto;
    const formattedPhone = formatPhone(phone);
    const updatedUser = await this.prisma.user.update({
      where: { phone: formattedPhone },
      data: { firstName, lastName, email },
    });
    return updatedUser;
  }
}
