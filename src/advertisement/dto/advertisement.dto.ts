import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsDate,
  ValidateIf,
  MinDate,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdvertisementDto {
  @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL.' })
  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Ad Link',
  })
  logo?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Brand New Car',
    description: 'Ad Title',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Brand New Car for Sale',
    description: 'Ad Description',
  })
  description: string;

  @IsNotEmpty()
  @IsUrl({}, { message: 'Link must be a valid URL.' })
  @ApiProperty({
    example: 'https://example.com',
    description: 'Ad Logo',
  })
  link: string;

  @ApiProperty({
    example: '2025-09-30T00:00:00.000Z',
    description: 'Ad Expire Date',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @MinDate(new Date(), { message: `Ad Expire date cannot be in the past.` })
  expireDate: Date;
}
export class UpdateAdvertisementDto extends PartialType(
  CreateAdvertisementDto,
) {}
