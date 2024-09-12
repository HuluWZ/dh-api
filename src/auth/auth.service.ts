import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp/otp.service';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { formatPhone } from 'phone-formater-eth';
import { JwtService } from '@nestjs/jwt';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly authJwtService: JwtService,
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
  ): Promise<{ accessToken: string; user: User; isActive: boolean }> {
    const formattedPhone = formatPhone(verifyOtpDto.phone);
    const user = await this.prisma.user.findUnique({
      where: { phone: formattedPhone },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const verifyUser = await this.otpService.verifyOtp(
      formattedPhone,
      verifyOtpDto.otpCode,
    );
    if (!verifyUser.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Generate JWT token with phone and id as payload
    const payload = { phone: verifyUser.phone, sub: verifyUser.id };
    const accessToken = this.authJwtService.sign(payload);

    return { accessToken, user: verifyUser, isActive: true };
  }

  async completeProfile(
    id: number,
    completeProfileDto: CompleteProfileDto,
  ): Promise<User> {
    const { firstName, lastName, email } = completeProfileDto;
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { firstName, lastName, email },
    });
    return updatedUser;
  }
  async getUserByPhone(phone: string): Promise<User> {
    const formattedPhone = formatPhone(phone);
    const user = await this.prisma.user.findUnique({
      where: { phone: formattedPhone },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  async getMe(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async searchUser(name: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: name, mode: 'insensitive' } },
          { lastName: { contains: name, mode: 'insensitive' } },
          { phone: { contains: name, mode: 'insensitive' } },
          { email: { contains: name, mode: 'insensitive' } },
        ],
      },
    });
  }
  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.authJwtService.verify(token);
      return decoded;
    } catch (e: any) {
      console.error(e);
      throw new UnauthorizedException('Invalid token');
    }
  }
  async checkIfUserExistByPhone(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone, isActive: true },
    });
    return !!user;
  }
}
