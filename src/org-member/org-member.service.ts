import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateOrgMemberDto, UpdateOrgMemberDto } from './dto/org-member.dto';
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
  async addMember(createOrgMemberDto: CreateOrgMemberDto) {
    return this.prisma.orgMember.create({
      data: { ...createOrgMemberDto },
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
    updateOrgMemberRole: UpdateOrgMemberDto,
  ) {
    return this.prisma.orgMember.update({
      where: { orgId_memberId: { orgId, memberId } },
      data: { ...updateOrgMemberRole },
    });
  }

  async deleteMember(orgId: number, memberId: number) {
    const member = await this.prisma.orgMember.findFirst({
      where: { orgId, memberId },
      include: { org: { select: { id: true } } },
    });

    if (!member) {
      throw new NotFoundException(
        `Member ID ${memberId} with  Org ID ${orgId} not found`,
      );
    }

    if (member.role === 'Owner') {
      throw new UnauthorizedException(
        'You are not authorized to delete Org Owner',
      );
    }

    return this.prisma.orgMember.delete({
      where: { orgId_memberId: { orgId, memberId } },
    });
  }
}
