import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateConnectorDto {
  @ApiProperty({
    example: 2,
    description: 'Organization Id',
  })
  @IsInt()
  @IsNotEmpty()
  orgId: number;
}

export enum OwnershipTransferStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export class UpdateConnectorDto {
  @ApiProperty({
    example: 'Approved / Rejected ',
    description: 'Org Connector Request Status',
  })
  @IsEnum(OwnershipTransferStatus)
  @IsNotEmpty()
  status: OwnershipTransferStatus;
}
