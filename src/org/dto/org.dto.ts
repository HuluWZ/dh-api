import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

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
  @IsOptional()
  regionId?: number;
  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Array of Member IDs',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  members?: number[];
}

export class UpdateOrgDto extends OmitType(CreateOrgDto, [
  'members',
] as const) {}

export class CreateOrgOwnershipTransfer {
  @ApiProperty({
    example: 2,
    description: 'Organization Id',
  })
  @IsInt()
  @IsNotEmpty()
  orgId: number;

  @ApiProperty({
    example: 2,
    description: 'New Owner Id',
  })
  @IsInt()
  @IsNotEmpty()
  newOwnerId: number;
}

export enum OwnershipTransferStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export class UpdateOrgOwnershipTransferStatus {
  @ApiProperty({
    example: 'Approved / Rejected ',
    description: 'Ownership Transfer Status',
  })
  @IsEnum(OwnershipTransferStatus)
  @IsNotEmpty()
  type: OwnershipTransferStatus;
}
