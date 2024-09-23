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

  async getMyGroupMembers(memberId: number) {
    const orgGroupMembers = await this.prisma.orgGroupMember.findMany({
      where: { memberId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            org: {
              select: {
                id: true,
                name: true,
                industry: { select: { name: true } },
                region: { select: { name: true } },
                ownerId: true,
              },
            },
          },
        },
      },
    });
    const groups = orgGroupMembers.map((member) => member.group);
    const myOrgIds = (await this.orgService.getMyOrgs(memberId)).map(
      (org) => org.id,
    );
    const myGroups = await this.prisma.orgGroup.findMany({
      where: { orgId: { in: myOrgIds } },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            industry: { select: { name: true } },
            region: { select: { name: true } },
            ownerId: true,
          },
        },
      },
    });
    return { groups, myGroups };
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
