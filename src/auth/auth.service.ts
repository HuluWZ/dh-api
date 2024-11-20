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
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeviceService } from 'src/common/device/device.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly authJwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly deviceService: DeviceService,
    private readonly redisService: RedisService,
  ) {}
  async sendOtp(sendOtpDto: SendOtpDto): Promise<void> {
    const formattedPhone = formatPhone(sendOtpDto.phone);
    if (formattedPhone === 'INVALID_PHONE_NUMBER') {
      throw new Error(`Invalid phone number : ${sendOtpDto.phone}`);
    }

    await this.otpService.sendOtp(formattedPhone);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
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
    const accessToken = await this.generateAccessToken(
      verifyUser.id,
      verifyUser.phone,
    );
    console.log('Device Id', verifyOtpDto.deviceId);
    await this.deviceService.create({
      userId: verifyUser.id,
      deviceId: verifyOtpDto.deviceId,
    });
    const refreshToken = await this.generateRefreshToken(verifyUser.id);
    const sessionId = await this.redisService.createUserSession(
      verifyUser.id.toString(),
      verifyOtpDto.platform,
      verifyOtpDto.deviceId,
      verifyOtpDto.model,
    );
    return {
      accessToken,
      refreshToken,
      sessionId,
      user: verifyUser,
      isActive: true,
    };
  }

  async completeProfile(
    id: number,
    completeProfileDto: CompleteProfileDto,
    file?: Express.Multer.File,
  ) {
    let url = null;
    if (file) {
      url = await this.cloudinaryService.uploadFile(file);
    }
    const userName = await this.generateUsername(completeProfileDto);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...completeProfileDto,
        profile: url,
        userName,
      },
    });
    return updatedUser;
  }

  async getUserByPhone(phone: string) {
    const formattedPhone = formatPhone(phone);
    const user = await this.prisma.user.findUnique({
      where: { phone: formattedPhone },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByUsername(userName: string) {
    return this.prisma.user.findUnique({
      where: { userName },
    });
  }
  async generateUsername(completeProfile: CompleteProfileDto) {
    const userName = `${completeProfile.firstName}${completeProfile.middleName}${completeProfile.lastName}`;
    const user = await this.getUserByUsername(userName);
    if (user) {
      return `${userName}.${Math.floor(Math.random() * 10000)}`;
    }
    return userName;
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async getMe(id: number) {
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

  async validateToken(token: string) {
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
  async generateAccessToken(userId: number, phone: string) {
    const payload = { sub: userId, phone };
    return this.authJwtService.sign(payload);
  }

  async generateRefreshToken(userId: number) {
    const payload = { sub: userId };
    return this.authJwtService.sign(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: process.env.REFRESH_JWT_EXPIRATION,
    });
  }
}
