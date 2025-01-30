import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCatalogDto {
  @ApiProperty({ example: '2', description: 'Org Id' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  orgId: number;

  @ApiProperty({
    example: 'New Catalog',
    description: 'Catalog Name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'New Catalog Description',
    description: 'Catalog Description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'false', description: 'Is Catalog Hidden' })
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : false,
  )
  is_hidden: boolean;

  @ApiProperty({
    description: 'Catalog Image/Video',
    type: 'string',
    format: 'binary',
    required: true,
  })
  file: Express.Multer.File;
}
export class UpdateCatalogDto extends OmitType(CreateCatalogDto, [
  'file',
] as const) {}
