import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ProfileVisibilityType {
  Everybody = 'Everybody',
  Nobody = 'Nobody',
  MyContacts = 'MyContacts',
}

export class CompleteProfileDto {
  @ApiProperty({ example: 'John', description: 'First Name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'A', description: 'Middle Name' })
  @IsNotEmpty()
  @IsString()
  middleName: string;

  @ApiProperty({ example: 'Doe', description: 'Last Name' })
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

  @ApiProperty({
    description: 'Profile Picture',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({
    example: 'Everybody / Nobody / MyContacts',
    description: 'Phone Visibility',
  })
  @IsEnum(ProfileVisibilityType)
  @IsOptional()
  phoneVisibility: ProfileVisibilityType;

  @ApiProperty({
    example: 'Everybody / Nobody / MyContacts',
    description: 'Last Seen Visibility',
  })
  @IsEnum(ProfileVisibilityType)
  @IsOptional()
  lastSeenVisibility: ProfileVisibilityType;
}

export class QRCodeDto {
  @ApiProperty({
    example: '2025-09-30T00:00:00.000Z',
    description: 'Task Deadline',
  })
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  expireDate: Date;

  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  id: number;
}
