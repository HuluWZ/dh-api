import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteProfileDto {
  @ApiProperty({ example: '+251910214243', description: 'Phone Number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'John', description: 'First Name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'LAst Name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@gmail.com',
    description: 'Email Address',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
