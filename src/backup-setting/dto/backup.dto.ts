import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

enum BackupSchedule {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
}

export class CreateBackupDto {
  @ApiProperty({ example: false, description: 'Auto Backup', default: false })
  @IsBoolean()
  @Type(() => Boolean)
  auto_backup: boolean = false;

  @ApiProperty({
    example: false,
    description: 'Including Video',
    default: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  including_video: boolean = false;

  @ApiProperty({
    example: false,
    description: 'Cellular Backup',
    default: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  cellular_backup: boolean = false;

  @ApiProperty({
    example: 'Daily',
    description: 'Backup Schedule',
    enum: BackupSchedule,
  })
  @IsEnum(BackupSchedule)
  backup_schedule: BackupSchedule;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Backup Time' })
  @IsString()
  @Type(() => Date)
  backup_time: Date;
}

export class UpdateBackupDto extends PartialType(CreateBackupDto) {}
