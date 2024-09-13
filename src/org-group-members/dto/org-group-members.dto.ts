import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateOrgGroupMemberDto {
  @ApiProperty({ example: '1', description: 'Org Group Id' })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @ApiProperty({ example: '2', description: 'Group Member Id' })
  @IsNotEmpty()
  @IsNumber()
  memberId: number;
}

export class UpdateOrgGroupMember extends PartialType(
  CreateOrgGroupMemberDto,
) {}
