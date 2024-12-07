import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAdvertisementDto,
  UpdateAdvertisementDto,
} from './dto/advertisement.dto';

@Injectable()
export class AdvertisementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdvertisementDto: CreateAdvertisementDto) {
    if (createAdvertisementDto.expireDate <= new Date()) {
      throw new BadRequestException('Expire date cannot be in the past.');
    }
    return this.prisma.advertisement.create({ data: createAdvertisementDto });
  }

  findAll() {
    return this.prisma.advertisement.findMany();
  }

  findOne(id: number) {
    return this.prisma.advertisement.findUnique({ where: { id } });
  }

  async update(id: number, updateAdvertisementDto: UpdateAdvertisementDto) {
    if (
      updateAdvertisementDto.expireDate &&
      updateAdvertisementDto.expireDate <= new Date()
    ) {
      throw new BadRequestException('Expire date cannot be in the past.');
    }
    return this.prisma.advertisement.update({
      where: { id },
      data: updateAdvertisementDto,
    });
  }

  remove(id: number) {
    return this.prisma.advertisement.delete({ where: { id } });
  }
}
