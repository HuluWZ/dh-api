import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp/otp.service';
import { SendOtpDto, VerifyOtpDto, verifyPhoneChange } from './dto/otp.dto';
import { formatPhone } from 'phone-formater-eth';
import { JwtService } from '@nestjs/jwt';
import { CompleteProfileDto, QRCodeDto } from './dto/complete-profile.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeviceService } from 'src/common/device/device.service';
import { RedisService } from 'src/redis/redis.service';
import phone from 'phone';
import * as QRCode from 'qrcode';

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
  async findUserByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }
  async findUserPhoneNumbersByPhone(number: string) {
    return this.prisma.phoneNumber.findUnique({
      where: { number },
    });
  }
  async findUserPhoneNumbersByMultiplePhones(numbers: string[]) {
    return this.prisma.phoneNumber.findMany({
      where: { number: { in: numbers } },
    });
  }

  async findUsersByPhones(phones: string[]) {
    const results = {};
    for (const phone of phones) {
      const user = await this.findUserByPhone(phone);
      results[phone] = user;
    }
    return results;
  }
  async createUserWithPhone(phone_number: string) {
    const { isValid, phoneNumber } = phone(phone_number, { country: 'ETH' });
    if (!isValid) {
      throw new BadRequestException(`Invalid phone number : ${phone}`);
    }
    const user = await this.prisma.user.findUnique({
      where: { phone: phoneNumber },
    });
    if (user) {
      throw new BadRequestException('User already exists');
    }
    return this.prisma.user.create({
      data: { phone: phoneNumber },
    });
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
      const decoded = this.authJwtService.verify(token, {});
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
  async requestPhoneChange(userId: number, phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.phone === phone) {
      throw new BadRequestException('Phone number is the same');
    }
    const otpCode = this.otpService.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    await this.prisma.phoneChangeRequests.create({
      data: { userId, phone, otpCode, otpExpiresAt },
    });
  }
  async verifyPhoneChange(
    userId: number,
    verifyPhoneChange: verifyPhoneChange,
  ) {
    const { phone, otpCode } = verifyPhoneChange;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const phoneChangeRequest = await this.prisma.phoneChangeRequests.findFirst({
      where: { userId, phone, otpCode },
    });
    if (!phoneChangeRequest || phoneChangeRequest.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    await this.prisma.phoneChangeRequests.deleteMany({
      where: { userId },
    });
    return this.prisma.user.update({
      where: { id: userId },
      data: { phone },
    });
  }
  async generateQRCode(id: number) {
    const now = new Date();
    const expireDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // Add 1 day in milliseconds
    if (expireDate <= now) {
      throw new BadRequestException('Expire date must be in the future.');
    }

    const qrData = JSON.stringify({ id, expireDate });
    console.log(`QR Data: ${qrData}`);
    return QRCode.toDataURL(qrData);
  }

  async validateQRCode(qrData: QRCodeDto) {
    try {
      const { id, expireDate } = qrData;
      console.log('Expire Date', expireDate);
      if (new Date(expireDate) <= new Date()) {
        throw new BadRequestException('QR code has expired.');
      }
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      return { message: 'QR code is valid', user };
    } catch (error) {
      throw new BadRequestException('Invalid QR code.');
    }
  }
  async addAdditionalPhoneNumbers(userId: number, phoneNumbers: string[]) {
    const existingPhoneNumbers = await this.prisma.phoneNumber.findMany({
      where: { number: { in: phoneNumbers } },
    });
    if (existingPhoneNumbers.length > 0) {
      throw new BadRequestException(
        'Phone numbers already linked with another',
      );
    }
    const phoneNumbersToCreate = phoneNumbers.map((number) => {
      return {
        number,
        userId,
      };
    });
    return this.prisma.phoneNumber.createMany({
      data: phoneNumbersToCreate,
    });
  }
  async disconnectExistingPhoneNumbers(userId: number, phoneNumbers: string[]) {
    return this.prisma.phoneNumber.deleteMany({
      where: { userId, number: { in: phoneNumbers } },
    });
  }
  async getMyAdditionalPhones(userId: number) {
    return this.prisma.phoneNumber.findMany({ where: { userId } });
  }
}
