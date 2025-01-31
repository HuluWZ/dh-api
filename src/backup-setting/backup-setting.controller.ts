import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { BackupSettingService } from './backup-setting.service';
import { CreateBackupDto, UpdateBackupDto } from './dto/backup.dto';

@ApiTags('Backup Setting')
@ApiBearerAuth()
@Controller('backup-setting')
@UseGuards(AuthGuard)
export class BackupSettingController {
  constructor(private readonly backupService: BackupSettingService) {}

  @Post()
  @ApiOperation({ summary: 'Create Backup Setting' })
  async createBackupSetting(
    @Req() req: any,
    @Body() createBackupDto: CreateBackupDto,
  ) {
    const userId: number = req.user.id;
    const userSetting = await this.backupService.findByUserId(userId);
    if (userSetting) {
      throw new BadRequestException(
        'Backup setting already exists. Try to update existing setting',
      );
    }
    return this.backupService.create(createBackupDto, userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get  My Backup Setting' })
  findMyBackupSetting(@Req() req: any) {
    const userId: number = req.user.id;
    return this.backupService.findByUserId(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update Backup Setting' })
  async updateBackupSetting(
    @Req() req: any,
    @Body() updateBackupDto: UpdateBackupDto,
  ) {
    const userId: number = req.user.id;
    const userSetting = await this.backupService.findByUserId(userId);
    if (!userSetting) {
      throw new BadRequestException('Backup setting not found');
    }
    return this.backupService.update(userId, updateBackupDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete My Backup Setting' })
  removeBackupSetting(@Req() req: any) {
    const userId: number = req.user.id;
    return this.backupService.remove(userId);
  }
}
