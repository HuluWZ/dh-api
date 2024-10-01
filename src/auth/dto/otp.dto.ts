import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+251910214243', description: 'Phone Number' })
  @IsNotEmpty()
  @IsPhoneNumber('ET')
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+251910214243', description: 'Phone Number' })
  @IsNotEmpty()
  @IsPhoneNumber('ET')
  phone: string;

  @ApiProperty({ example: '1234', description: 'OTP Code' })
  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otpCode: string;

  @ApiProperty({
    example: 'eJ9z5J2nQ1y:APA91bH7y5J2nQ1y',
    description: 'Device ID/Token',
  })
  @IsNotEmpty()
  @IsString()
  deviceId: string;
}
