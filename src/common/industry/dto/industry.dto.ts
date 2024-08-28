import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty({ example: 'Addis Ababa', description: 'Industry Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'True', description: 'Is Industry Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateIndustryDto {
  @ApiProperty({ example: 'Addis Ababa', description: 'Industry Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'True', description: 'Is Industry Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
