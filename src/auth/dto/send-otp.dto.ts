import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+251910214243', description: 'Phone Number' })
  @IsNotEmpty()
  @IsPhoneNumber('ET')
  phone: string;
}
