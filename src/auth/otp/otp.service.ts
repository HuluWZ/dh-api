import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { formatPhone } from 'phone-formater-eth'; // Phone number validation library

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  private generateOtp(): string {
    return '1234';
  }

  async sendOtp(phone: string): Promise<void> {
    const formattedPhone = formatPhone(phone);
    if (formattedPhone === 'INVALID_PHONE_NUMBER') {
      throw new Error(` Invalid phone number: ${phone}`);
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    const user = await this.prisma.user.findUnique({
      where: { phone: formattedPhone },
    });
    //  If user exist update otpCode and expiresAt else create user
    if (user) {
      await this.prisma.user.update({
        where: { phone: formattedPhone },
        data: { otpCode, otpExpiresAt },
      });
    } else {
      await this.prisma.user.create({
        data: { phone: formattedPhone, otpCode, otpExpiresAt },
      });
    }
    console.log(`OTP sent to ${formattedPhone}: ${otpCode}`);
  }

  async verifyOtp(phone: string, otpCode: string) {
    const formattedPhone = formatPhone(phone);
    const user = await this.prisma.user.findUnique({
      where: { phone: formattedPhone },
    });

    if (!user || user.otpCode !== otpCode || user.otpExpiresAt < new Date()) {
      throw new Error('Invalid or expired OTP');
    }

    if (!user.isActive) {
      await this.prisma.user.update({
        where: { phone: formattedPhone },
        data: { isActive: true, otpCode: null, otpExpiresAt: null },
      });
    }

    return user;
  }
}
