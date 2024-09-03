import { IsInt, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateOrgDto {
  @ApiProperty({ example: 'Zay Ride PLC', description: 'Organization Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1, description: 'Organization Industry' })
  @IsInt()
  industryId: number;

  @ApiProperty({
    example: 2,
    description: 'Organization Region/Address',
  })
  @IsInt()
  regionId: number;
}

export class UpdateOrgDto extends PartialType(CreateOrgDto) {}
