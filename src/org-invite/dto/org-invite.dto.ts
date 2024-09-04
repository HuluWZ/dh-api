import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InviteStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}
export class CreateOrgInviteDto {
  @ApiProperty({ example: '1', description: 'Org Id' })
  @IsNotEmpty()
  @IsNumber()
  orgId: number;

  @ApiProperty({ example: '1', description: 'Invitee User Id' })
  @IsNotEmpty()
  @IsNumber()
  inviteeId: number;
}

export class UpdateOrgInviteDto {
  @ApiProperty({ example: 'Approved / Rejected', description: 'Invite Status' })
  @IsNotEmpty()
  @IsEnum(InviteStatus)
  status: InviteStatus;
}
