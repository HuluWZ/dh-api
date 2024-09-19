import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateOrgGroupMemberDto } from './dto/org-group-members.dto';

@Injectable()
export class OrgGroupMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async isAlreadyGroupAdminRoleExists(orgGroupRole: CreateOrgGroupMemberDto) {
    return this.prisma.orgGroupAdmin.findFirst({
      where: { ...orgGroupRole },
    });
  }
  async addOrgMemberAdmin(orgGroupRole: CreateOrgGroupMemberDto) {
    return this.prisma.orgGroupAdmin.create({
      data: { ...orgGroupRole },
    });
  }
  async isAlreadyGroupMemberExists(orgGroupMember: CreateOrgGroupMemberDto) {
    return this.prisma.orgGroupMember.findFirst({
      where: { ...orgGroupMember },
    });
  }
  async addOrgGroupMember(createOrgGroupMemberDto: CreateOrgGroupMemberDto) {
    return this.prisma.orgGroupMember.create({
      data: { ...createOrgGroupMemberDto },
    });
  }
  async getGroupMembers(groupId: number) {
    return this.prisma.orgGroupMember.findMany({
      where: { groupId },
    });
  }
  async getMemberGroups(memberId: number) {
    return this.prisma.orgGroupMember.findMany({
      where: { memberId },
    });
  }
  async getMemberGroup(memberId: number, groupId: number) {
    return this.prisma.orgGroupMember.findFirst({
      where: { memberId, groupId },
    });
  }
  async removeGroupMember(groupId: number, memberId: number) {
    return this.prisma.orgGroupMember.delete({
      where: { groupId_memberId: { groupId, memberId } },
    });
  }
}
