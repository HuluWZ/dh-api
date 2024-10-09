import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeviceDto } from './dto/device.dto';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    const device = await this.findDeviceByUserId(createDeviceDto.userId);
    if (device) {
      return this.update(createDeviceDto.userId, createDeviceDto.deviceId);
    } else {
      return this.prisma.fCM.create({
        data: createDeviceDto,
      });
    }
  }

  async findAll() {
    return this.prisma.fCM.findMany({
      select: {
        user: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            profile: true,
            createdAt: true,
          },
        },
        deviceId: true,
      },
    });
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
  async findDeviceByUserId(userId: number) {
    return this.prisma.fCM.findFirst({
      where: { userId },
    });
  }
  async deleteDeviceByUserId(userId: number) {
    return this.prisma.fCM.deleteMany({
      where: { userId },
    });
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
