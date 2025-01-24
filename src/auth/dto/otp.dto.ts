import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';

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

  @ApiProperty({
    example: 'IOS Or Android',
    description: 'Platform',
  })
  @IsNotEmpty()
  @IsString()
  platform: string;

  @ApiProperty({
    example: 'Samsung S20',
    description: 'Model',
  })
  @IsOptional()
  @IsString()
  model?: string;
}

export class verifyPhoneChange extends OmitType(VerifyOtpDto, [
  'deviceId',
  'model',
  'platform',
] as const) {}

export class CheckPhoneNoDto {
  @ApiProperty({ example: ['+251910214243'], description: 'Phone Number' })
  @IsNotEmpty()
  phones: string[];
}
