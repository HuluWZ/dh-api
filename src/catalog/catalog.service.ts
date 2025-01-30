import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateCatalogDto, UpdateCatalogDto } from './dto/catalog.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCatalog(
    createCatalogDto: CreateCatalogDto,
    image_video_link: string,
  ) {
    const { file, ...rest } = createCatalogDto;
    return this.prismaService.catalog.create({
      data: { ...rest, image_video_link },
    });
  }

  getCatalogs() {
    return this.prismaService.catalog.findMany({ include: { org: true } });
  }

  getCatalogById(id: number) {
    return this.prismaService.catalog.findUnique({
      where: { id },
      include: { org: true },
    });
  }

  getCatalogByOrgId(orgId: number) {
    return this.prismaService.catalog.findMany({
      where: { orgId },
      include: { org: true },
    });
  }

  deleteCatalog(id: number) {
    return this.prismaService.catalog.delete({ where: { id } });
  }

  updateCatalog(id: number, updateCatalogDto: UpdateCatalogDto) {
    return this.prismaService.catalog.update({
      where: { id },
      data: { ...updateCatalogDto },
    });
  }
}
