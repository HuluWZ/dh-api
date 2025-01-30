import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuickReplyDto {
  @ApiProperty({
    example: '/payment',
    description: 'Quick Reply Shortcut',
  })
  @IsNotEmpty()
  @IsString()
  shortcut: string;

  @ApiProperty({
    example: 'We accept payment through',
    description: 'Quick Reply Message',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
export class UpdateQuickReplyDto extends PartialType(CreateQuickReplyDto) {}
