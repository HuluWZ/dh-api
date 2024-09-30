import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: 'jkek3ceio31', description: 'Device Id' })
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiProperty({ example: 2, description: 'User Id' })
  @IsInt()
  userId: number;
}

export class UpdateDeviceDto {
  @ApiProperty({ example: 'jkek3ceio31', description: 'Device Id' })
  @IsNotEmpty()
  @IsString()
  deviceId: string;
}
