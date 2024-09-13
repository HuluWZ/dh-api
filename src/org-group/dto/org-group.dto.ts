import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrgGroupDto {
  @ApiProperty({ example: 'Finance', description: 'Org Group Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1, description: 'Org Id' })
  @IsInt()
  orgId: number;
}

export class UpdateOrgGroupDto {
  @ApiProperty({ example: 'Finance', description: 'Org Group Name' })
  @IsString()
  @IsOptional()
  name: string;
}
