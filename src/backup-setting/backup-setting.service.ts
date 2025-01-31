import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBackupDto, UpdateBackupDto } from './dto/backup.dto';

@Injectable()
export class BackupSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBackupDto: CreateBackupDto, userId: number) {
    return this.prisma.userBackupSetting.create({
      data: { ...createBackupDto, userId },
    });
  }

  findAll() {
    return this.prisma.userBackupSetting.findMany({ include: { user: true } });
  }

  findByUserId(userId: number) {
    return this.prisma.userBackupSetting.findUnique({ where: { userId } });
  }

  async update(userId: number, updateBackupDto: UpdateBackupDto) {
    return this.prisma.userBackupSetting.update({
      where: { userId },
      data: updateBackupDto,
    });
  }

  remove(userId: number) {
    return this.prisma.userBackupSetting.delete({ where: { userId } });
  }
}
