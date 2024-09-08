import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateOrgMemberDto, UpdateOrgMemberDto } from './dto/org-member.dto';

@Injectable()
export class OrgMemberService {
  constructor(private readonly prisma: PrismaService) {}
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
    return this.prisma.orgMember.findMany({
      where: { orgId, memberId },
      include: {
        member: { select: { firstName: true, lastName: true, phone: true } },
        org: {
          select: {
            name: true,
            industry: { select: { name: true } },
            region: { select: { name: true } },
          },
        },
      },
    });
  }

  async getOrgAllMembers(orgId: number) {
    return this.prisma.orgMember.findMany({
      where: { orgId },
      include: {
        member: { select: { firstName: true, lastName: true, phone: true } },
        org: {
          select: {
            name: true,
            industry: { select: { name: true } },
            region: { select: { name: true } },
          },
        },
      },
    });
  }

  async getMyOrgMembers(ownerId: number) {
    return this.prisma.orgMember.findMany({
      where: { org: { ownerId: ownerId } },
      include: {
        org: {
          select: { name: true },
          include: {
            industry: { select: { name: true } },
            region: { select: { name: true } },
          },
        },
        member: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
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
