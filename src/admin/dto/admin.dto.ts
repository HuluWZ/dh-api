import { IsInt } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 20, description: 'User Id' })
  @IsInt()
  userId: number;
}

export class UpdateAdminDto extends PartialType(CreateAdminDto) {}
