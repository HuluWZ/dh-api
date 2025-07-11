import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { OtpService } from './otp/otp.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeviceService } from 'src/common/device/device.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_JWT_SECRET,
      signOptions: { expiresIn: process.env.AUTH_JWT_EXPIRATION },
    }),
    JwtModule.register({
      secret: process.env.REFRESH_JWT_SECRET,
      signOptions: { expiresIn: process.env.REFRESH_JWT_EXPIRATION },
    }),
  ],
  providers: [
    AuthService,
    OtpService,
    CloudinaryService,
    DeviceService,
    RedisService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
