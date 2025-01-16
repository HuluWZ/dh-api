import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum OrgMemberStatus {
  Member = 'Member',
  Admin = 'Admin',
  Owner = 'Owner',
  Connector = 'Connector',
}

export class CreateOrgMemberDto {
  @ApiProperty({ example: '1', description: 'Org Id' })
  @IsNotEmpty()
  @IsNumber()
  orgId: number;

  @ApiProperty({ example: '1', description: 'Member User Id' })
  @IsNotEmpty()
  @IsNumber()
  memberId: number;

  @ApiProperty({
    example: 'Member / Admin / Owner /Connector',
    description: 'Member Status',
  })
  @IsEnum(OrgMemberStatus)
  @IsOptional()
  role: OrgMemberStatus;
}

export class CreateOrgMemberWithCustomersDto extends OmitType(
  CreateOrgMemberDto,
  ['memberId', 'role'] as const,
) {
  @ApiProperty({ example: '+251945678908', description: 'Phone Number' })
  @IsNotEmpty()
  @IsString()
  phone_number: string;
}
export class UpdateOrgMemberDto {
  @ApiProperty({
    example: 'General Manager',
    description: 'Position of the member in the organization',
  })
  @IsString()
  @IsOptional()
  position?: string;
}

export class CreateMultipleOrgMemberDto {
  @ApiProperty({ example: '1', description: 'Org Id' })
  @IsNotEmpty()
  @IsNumber()
  orgId: number;

  @ApiProperty({ example: ['1'], description: 'Member User Ids' })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map(Number))
  memberId: number[];

  @ApiProperty({
    example: ['Member', 'Admin', 'Owner'],
    description: 'Member Statuses',
  })
  @IsEnum(OrgMemberStatus, { each: true })
  @IsOptional()
  @IsArray()
  role: OrgMemberStatus[];
}

export class UpdateMemberRoleDto {
  @ApiProperty({
    example: 'Member / Admin / Owner',
    description: 'Member Status',
  })
  @IsEnum(OrgMemberStatus)
  role: OrgMemberStatus;
}

export class DeleteOrgMembersDto extends OmitType(CreateMultipleOrgMemberDto, [
  'orgId',
  'role',
] as const) {}

export class CreateOrgMemberWithPhoneNoDto extends OmitType(
  CreateOrgMemberDto,
  ['memberId', 'role'] as const,
) {
  @ApiProperty({ example: ['+251945678908'], description: 'Phone Numbers' })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  phone_numbers: string[];
}
