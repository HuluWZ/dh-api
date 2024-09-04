import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgDto, UpdateOrgDto } from './dto/org.dto';
import { Org } from '@prisma/client';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrg(
    ownerId: number,
    createOrgDto: CreateOrgDto,
    logoUrl?: string,
  ) {
    return this.prisma.org.create({
      data: {
        ...createOrgDto,
        logo: logoUrl || null,
        ownerId,
      },
    });
  }

  async getAllOrgs(): Promise<Org[]> {
    return this.prisma.org.findMany({
      include: {
        industry: { select: { name: true, isActive: true } },
        region: { select: { name: true, isActive: true } },
      },
    });
  }

  async getOne(id: number): Promise<Org> {
    const organization = await this.prisma.org.findUnique({
      where: { id },
      include: {
        industry: { select: { name: true, isActive: true } },
        region: { select: { name: true, isActive: true } },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async getMyOrgs(ownerId: number): Promise<Org[]> {
    return this.prisma.org.findMany({
      where: { ownerId },
      include: {
        industry: { select: { name: true, isActive: true } },
        region: { select: { name: true, isActive: true } },
      },
    });
  }

  async deleteOrg(id: number, ownerId: number): Promise<Org> {
    const organization = await this.prisma.org.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    if (organization.ownerId !== ownerId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this organization',
      );
    }

    return this.prisma.org.delete({ where: { id } });
  }
  async updateOrg(
    orgId: number,
    ownerId: number,
    updateOrgDto: UpdateOrgDto,
    logoUrl?: string,
  ) {
    const organization = await this.prisma.org.findUnique({
      where: { id: orgId },
    });

    if (!organization || organization.ownerId !== ownerId) {
      throw new NotFoundException('Organization not found or unauthorized');
    }

    return this.prisma.org.update({
      where: { id: orgId },
      data: {
        ...updateOrgDto,
        logo: logoUrl || organization.logo,
      },
    });
  }
  async searchOrg(name: string) {
    return this.prisma.org.findMany({
      where: {
        OR: [
          { name: { contains: name, mode: 'insensitive' } },
          { region: { name: { contains: name, mode: 'insensitive' } } },
          { industry: { name: { contains: name, mode: 'insensitive' } } },
        ],
      },
    });
  }
}
