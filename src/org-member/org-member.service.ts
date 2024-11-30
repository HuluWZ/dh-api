import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import {
  CreateMultipleOrgMemberDto,
  CreateOrgMemberDto,
  OrgMemberStatus,
  UpdateMemberRoleDto,
  UpdateOrgMemberDto,
} from './dto/org-member.dto';
import { OrgService } from 'src/org/org.service';

@Injectable()
export class OrgMemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgService: OrgService,
  ) {}
  async isAlreadyMemberExists(orgId: number, memberId: number) {
    return this.prisma.orgMember.findFirst({
      where: {
        orgId,
        memberId,
      },
    });
  }
  async addMember(createOrgMemberDto: CreateMultipleOrgMemberDto) {
    const { orgId, memberId, role } = createOrgMemberDto;
    const members = memberId.map((id, index) => ({
      orgId,
      memberId: id,
      role: role ? role[index] : undefined,
    }));

    return this.prisma.orgMember.createMany({
      data: members,
    });
  }
  async getOrgMembers(orgId: number, memberId: number) {
    return this.prisma.orgMember.findFirst({
      where: { orgId, memberId },
      include: {
        org: {
          select: {
            name: true,
            industry: { select: { name: true } },
            region: { select: { name: true } },
          },
        },
        member: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });
  }

  async getOrgAllMembers(orgId: number) {
    const org = await this.orgService.getOne(orgId);
    const members = await this.prisma.orgMember.findMany({
      where: { orgId },
      include: {
        member: {
          select: {
            userName: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
    return { ...org, members };
  }

  async searchOrgMembers(orgId: number, search: string) {
    const org = await this.orgService.getOne(orgId);
    if (!org) {
      throw new NotFoundException(`Org ID ${orgId} not found`);
    }
    const members = await this.prisma.orgMember.findMany({
      where: { orgId, member: { userName: { startsWith: search } } },
      include: {
        member: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
    const allMembers = members.map((member) => member.member);
    return allMembers;
  }
  async searchGroupMembers(groupId: number, search: string) {
    const group = await this.prisma.orgGroup.findFirst({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group ID ${groupId} not found`);
    }

    const members = await this.prisma.orgGroupMember.findMany({
      where: { groupId, member: { userName: { startsWith: search } } },
      include: {
        member: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    const allMembers = members.map((member) => member.member);
    return allMembers;
  }

  async getMyOrgMembers(ownerId: number) {
    const myOrgs = await this.orgService.getMyOrgs(ownerId);
    const data = await Promise.all(
      myOrgs.map(async (org) => {
        const members = await this.prisma.orgMember.findMany({
          where: { orgId: org.id },
          include: {
            member: {
              select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        });
        return { ...org, members };
      }),
    );

    return data;
  }

  async getOrgMember(memberId: number, orgId: number) {
    return this.prisma.orgMember.findFirst({ where: { memberId, orgId } });
  }
  async updateMember(
    orgId: number,
    memberId: number,
    updateOrgMember: UpdateOrgMemberDto,
  ) {
    return this.prisma.orgMember.update({
      where: { orgId_memberId: { orgId, memberId } },
      data: { ...updateOrgMember },
    });
  }
  async updateMemberRole(
    orgId: number,
    memberId: number,
    updateMemberRole: UpdateMemberRoleDto,
  ) {
    return this.prisma.orgMember.update({
      where: { orgId_memberId: { orgId, memberId } },
      data: { ...updateMemberRole },
    });
  }

  async deleteMembers(orgId: number, memberIds: number[]) {
    const validMemberIds = [];

    for (const memberId of memberIds) {
      const member = await this.prisma.orgMember.findFirst({
        where: { orgId, memberId },
        include: { org: { select: { id: true } } },
      });

      if (member && member.role !== 'Owner') {
        validMemberIds.push(memberId);
      }
    }

    if (validMemberIds.length === 0) {
      throw new UnauthorizedException('No valid member IDs to delete');
    }
    return this.prisma.orgMember.deleteMany({
      where: {
        orgId,
        memberId: { in: validMemberIds },
      },
    });
  }
}
