import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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

export class CreateMultipleOrgGroupMemberDto {
  @ApiProperty({ example: '1', description: 'Org Group Id' })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @ApiProperty({ example: ['1'], description: 'Member Ids' })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map(Number))
  memberId: number[];
}
export class UpdateOrgGroupMember extends PartialType(
  CreateOrgGroupMemberDto,
) {}

export class DeleteMultipleGroupMembersDto extends OmitType(
  CreateMultipleOrgGroupMemberDto,
  ['groupId'],
) {}
