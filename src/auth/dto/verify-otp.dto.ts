import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: '+251910214243', description: 'Phone Number' })
  @IsNotEmpty()
  @IsPhoneNumber('ET')
  phone: string;

  @ApiProperty({ example: '5093', description: 'OTP Code' })
  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otpCode: string;
}
