import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
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

  @ApiProperty({
    example: '123 Main St',
    description: 'Organization Address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'Organization Website',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @IsString()
  website?: string;

  @ApiProperty({
    example: 'contact@example.com',
    description: 'Organization Contact',
    required: false,
  })
  @IsOptional()
  @IsString()
  contact?: string;
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
