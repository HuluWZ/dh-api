import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
enum MessageType {
  Text = 'Text',
  Video = 'Video',
  Audio = 'Audio',
}
export class CreatePrivateMessageDto {
  @ApiProperty({ example: 'Hello man', description: 'Message Content' })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'Text | Image | Video',
    description: 'Message Type',
  })
  @IsEnum(MessageType)
  @IsOptional()
  type: MessageType;

  @ApiProperty({ example: 1, description: 'Receiver Id' })
  @IsInt()
  receiverId: number;
}
