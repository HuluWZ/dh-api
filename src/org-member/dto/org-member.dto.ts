import { IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrgMemberStatus {
  Member = 'Member',
  Admin = 'Admin',
  Owner = 'Owner',
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
    example: 'Member / Admin / Owner',
    description: 'Member Status',
  })
  @IsEnum(OrgMemberStatus)
  @IsOptional()
  role: OrgMemberStatus;
}

export class UpdateOrgMemberDto {
  @ApiProperty({
    example: 'Member / Admin / Owner',
    description: 'Member Status',
  })
  @IsEnum(OrgMemberStatus)
  role: OrgMemberStatus;
}
