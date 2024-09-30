import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeviceDto } from './dto/device.dto';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    const device = await this.findByUserId(createDeviceDto.userId);
    if (device) {
      const update = await this.update(
        createDeviceDto.userId,
        createDeviceDto.deviceId,
      );
      return update;
    } else {
      return this.prisma.fCM.create({
        data: createDeviceDto,
      });
    }
  }

  async findAll() {
    return this.prisma.fCM.findMany({ select: { user: true } });
  }

  async findByUserId(userId: number) {
    const device = await this.prisma.fCM.findFirst({
      where: { userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async update(userId: number, deviceId: string) {
    return this.prisma.fCM.updateMany({
      where: {
        userId,
      },
      data: {
        deviceId,
      },
    });
  }
}
