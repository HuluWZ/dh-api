import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateRegionDto {
  @ApiProperty({ example: 'Addis Ababa', description: 'Region Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'true', description: 'Is Region Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRegionDto extends PartialType(CreateRegionDto) {}
