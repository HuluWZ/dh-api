import { Optional } from '@nestjs/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreatePollDto {
  @ApiProperty({ example: '2', description: 'Group Id' })
  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @ApiProperty({
    example: 'We got 2 options (May be more)?',
    description: 'Poll question',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: '["Monday", "Tuesday","Friday","Saturday"]',
    isArray: true,
    description: 'Answer Options',
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayUnique()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    example: 'true',
    description: 'Is Anonymous?',
  })
  @Optional()
  @IsBoolean()
  isAnonymous: boolean;
}

export class CreateVoteDto {
  @IsString()
  @IsNotEmpty()
  option: string;
}

export class UpdatePollDto extends OmitType(CreatePollDto, [
  'groupId',
] as const) {}
