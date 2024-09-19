import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { OrgService } from 'src/org/org.service';
import { CreateOrgGroupDto, UpdateOrgGroupDto } from './dto/org-group.dto';

@Injectable()
export class OrgGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgService: OrgService,
  ) {}

  async isAlreadyGroupExists(orgGroup: CreateOrgGroupDto) {
    return this.prisma.orgGroup.findFirst({ where: { ...orgGroup } });
  }

  async addOrgGroup(createOrgGroupDto: CreateOrgGroupDto) {
    return this.prisma.orgGroup.create({
      data: { ...createOrgGroupDto },
    });
  }

  async getGroup(id: number) {
    return this.prisma.orgGroup.findFirst({
      where: { id },
      include: {
        org: true,
        OrgGroupMember: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }
  async getAllGroups() {
    return this.prisma.orgGroup.findMany({ include: { org: true } });
  }

  async getOrgAllGroups(orgId: number) {
    const org = await this.orgService.getOne(orgId);
    const groups = await this.prisma.orgGroup.findMany({
      where: { orgId },
      include: {
        OrgGroupMember: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    return { ...org, groups };
  }

  async getMyOrgMembers(ownerId: number) {
    const myOrgs = await this.orgService.getMyOrgs(ownerId);
    const data = await Promise.all(
      myOrgs.map(async (org) => {
        const groups = await this.prisma.orgGroup.findMany({
          where: { orgId: org.id },
        });
        return { ...org, groups };
      }),
    );

    return data;
  }

  async updateGroup(id: number, updateOrgGroupDto: UpdateOrgGroupDto) {
    return this.prisma.orgGroup.update({
      where: { id },
      data: { ...updateOrgGroupDto },
    });
  }

  async deleteGroup(id: number) {
    return this.prisma.orgGroup.delete({
      where: { id },
    });
  }
}
