import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty({ example: 'Business', description: 'Industry Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'true', description: 'Is Industry Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateIndustryDto extends PartialType(CreateIndustryDto) {}
