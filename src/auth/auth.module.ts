import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { OtpService } from './otp/otp.service';

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
  providers: [AuthService, OtpService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
