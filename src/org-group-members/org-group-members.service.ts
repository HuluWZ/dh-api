import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateOrgGroupMemberDto } from './dto/org-group-members.dto';
import { MessageType } from '@prisma/client';

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
    const member = await this.prisma.user.findUnique({
      where: { id: createOrgGroupMemberDto.memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    const insertGroupMessage = await this.memberJoinedLeavedGroupMessage(
      [
        {
          firstName: member.firstName,
          groupId: createOrgGroupMemberDto.groupId,
          type: MessageType.System,
        },
      ],
      'Join',
    );
    return this.prisma.orgGroupMember.create({
      data: { ...createOrgGroupMemberDto },
    });
  }
  async addMultipleOrgGroupMembers(
    createMultipleOrgGroupMemberDto: {
      memberId: number;
      groupId: number;
    }[],
  ) {
    return this.prisma.orgGroupMember.createMany({
      data: { ...createMultipleOrgGroupMemberDto },
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
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    const insertGroupMessage = await this.memberJoinedLeavedGroupMessage(
      [
        {
          firstName: member.firstName,
          groupId: groupId,
          type: MessageType.System,
        },
      ],
      'Leave',
    );

    return this.prisma.orgGroupMember.delete({
      where: { groupId_memberId: { groupId, memberId } },
    });
  }
  async removeMultipleGroupMembers(groupId: number, memberIds: number[]) {
    return this.prisma.$transaction(
      memberIds.map((memberId) =>
        this.prisma.orgGroupMember.delete({
          where: { groupId_memberId: { groupId, memberId } },
        }),
      ),
    );
  }
  async memberJoinedLeavedGroupMessage(
    userJoinedLeavedGroup: {
      groupId: number;
      type: MessageType;
      firstName: string;
    }[],
    leave_join: 'Leave' | 'Join',
  ) {
    return Promise.all(
      userJoinedLeavedGroup.map(({ firstName, groupId, type }) =>
        this.prisma.groupMessage.create({
          data: {
            content:
              leave_join === 'Join'
                ? `User ${firstName} has joined the group`
                : `User ${firstName} has left the group`,
            groupId,
            type,
          },
        }),
      ),
    );
  }
}
