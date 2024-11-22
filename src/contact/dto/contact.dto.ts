import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    example: 'Alex',
    description: 'Contact FirstName',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'G',
    description: 'Contact LastName',
  })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: '+251912904520',
    description: 'Phone Number',
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'DH ', description: 'Company Name' })
  @IsOptional()
  company?: string;

  @ApiProperty({ example: 'VG Street ', description: 'Address' })
  @IsOptional()
  address?: string;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {}
