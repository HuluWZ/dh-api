import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
  @ApiProperty({ example: 'Addis Ababa', description: 'Region Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'True', description: 'Is Region Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRegionDto {
  @ApiProperty({ example: 'Addis Ababa', description: 'Region Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'True', description: 'Is Region Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
