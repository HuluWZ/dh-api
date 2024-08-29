import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIndustryDto, UpdateIndustryDto } from './dto/industry.dto';

@Injectable()
export class IndustryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIndustryDto: CreateIndustryDto) {
    return this.prisma.industry.create({
      data: createIndustryDto,
    });
  }

  async findAll() {
    return this.prisma.industry.findMany({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const industry = await this.prisma.industry.findUnique({
      where: { id },
    });

    if (!industry) {
      throw new NotFoundException('Industry not found');
    }

    return industry;
  }

  async update(id: number, updateIndustryDto: UpdateIndustryDto) {
    return this.prisma.industry.update({
      where: { id },
      data: updateIndustryDto,
    });
  }

  async remove(id: number) {
    return this.prisma.industry.delete({
      where: { id },
    });
  }
}
