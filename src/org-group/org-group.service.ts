import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { OrgService } from 'src/org/org.service';
import { CreateOrgGroupDto, UpdateOrgGroupDto } from './dto/org-group.dto';
import { GroupInclude } from 'src/private-chat/dto/private.dto';

@Injectable()
export class OrgGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgService: OrgService,
  ) {}

  async isAlreadyGroupExists(orgGroup: CreateOrgGroupDto) {
    return this.prisma.orgGroup.findFirst({ where: { ...orgGroup } });
  }

  async addOrgGroup(createOrgGroupDto: CreateOrgGroupDto, userId?: number) {
    if (createOrgGroupDto.orgId) {
      return this.prisma.orgGroup.create({
        data: { ...createOrgGroupDto },
      });
    } else {
      return this.prisma.orgGroup.create({
        data: { ...createOrgGroupDto, createdBy: userId },
      });
    }
  }

  async getGroup(id: number) {
    return this.prisma.orgGroup.findFirst({
      where: { id },
      include: {
        org: true,
        personal: true,
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
    return this.prisma.orgGroup.findMany({
      include: { org: true, personal: true },
    });
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
    const groups = orgGroupMembers
      .map((member) => member.group)
      .filter((group) => group.org);
    const myOrgs = await this.orgService.getMyOrgs(memberId);
    const myOrgIds = myOrgs.map((org) => org.id);
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

  async getMyConnectorGroups(memberId: number, search?: string) {
    // Get My Groups that are connector and i am a member or owner of group
    const nameSearch = search ? { name: { contains: search } } : {};
    return this.prisma.orgGroup.findMany({
      where: {
        ...nameSearch,
        isConnector: true,
        OR: [
          { OrgGroupMember: { some: { memberId } } },
          { createdBy: memberId },
        ],
      },
      include: {
        GroupMessage: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: GroupInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyPersonalGroups(memberId: number) {
    const myPersonalGroups = await this.prisma.orgGroup.findMany({
      where: { createdBy: memberId },
      include: {
        personal: true,
      },
    });
    const personal = await this.prisma.orgGroupMember.findMany({
      where: { memberId },
      include: {
        group: {
          select: { id: true, name: true, personal: true },
        },
      },
    });
    const personalGroups = personal
      .map((member) => member.group)
      .filter((group) => group.personal);

    return { myPersonalGroups, personalGroups };
  }
  async updateGroup(id: number, updateOrgGroupDto: UpdateOrgGroupDto) {
    return this.prisma.orgGroup.update({
      where: { id },
      data: { ...updateOrgGroupDto },
    });
  }
  async pinUnpinGroup(id: number, action: string) {
    const pin = action.toLowerCase() === 'pin' ? true : false;
    return this.prisma.orgGroup.update({
      where: { id },
      data: { isPinned: pin },
    });
  }

  async deleteGroup(id: number) {
    return this.prisma.orgGroup.delete({
      where: { id },
    });
  }
  async getMyGroups(userId: number) {
    const myOrgs = await this.orgService.getMyOrgs(userId);
    const myOrgIds = myOrgs.map((org) => org.id);

    const groups = await this.prisma.orgGroup.findMany({
      where: { OR: [{ createdBy: userId, orgId: { in: myOrgIds } }] },
    });
    const groupIds = groups.map((group) => group.id);
    const members = await this.prisma.orgGroupMember.findMany({
      where: { memberId: userId },
    });
    const memberGroup = members.map((group) => group.groupId);
    const myGroups = Array.from(new Set([...groupIds, ...memberGroup]));
    return myGroups;
  }
  async createFirstTask(groupId: number, name: string, userId: number) {
    return this.prisma.task.create({
      data: {
        name,
        groupId,
        monitoredBy: userId,
        createdBy: userId,
        priority: 'Low',
        status: 'Backlog',
      },
    });
  }
}
