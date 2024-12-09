import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Param,
  UnauthorizedException,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateMultipleOrgGroupMemberDto,
  CreateOrgGroupMemberDto,
  DeleteMultipleGroupMembersDto,
} from './dto/org-group-members.dto';
import { OrgGroupMembersService } from './org-group-members.service';
import { OrgGroupMembersGuard } from './org-group-members.guard';
import { OrgGroupGuard } from 'src/org-group/org-group.guard';
import { OrgMemberService } from 'src/org-member/org-member.service';
import { AddOrgMemberToAdminForGroupGuard } from './org-group-admin.guard';
import { OrgGroupService } from 'src/org-group/org-group.service';

@ApiTags('Org Group Members')
@ApiBearerAuth()
@Controller('org-group-members')
export class OrgGroupMembersController {
  constructor(
    private readonly orgGroupMemberService: OrgGroupMembersService,
    private readonly orgMemberService: OrgMemberService,
    private readonly orgGroupService: OrgGroupService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add Org Members To Group' })
  @UseGuards(AuthGuard, OrgGroupMembersGuard)
  async addOrgMemberToGroup(
    @Body() createMultipleOrgGroupMemberDto: CreateMultipleOrgGroupMemberDto,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    const orgs: number[] = req.orgs;
    const orgId = req.orgId;
    const { groupId, memberId } = createMultipleOrgGroupMemberDto;

    if (orgId && !orgs.includes(orgId)) {
      throw new UnauthorizedException('Invalid Org Data');
    }
    const validMemberIds: number[] = [];
    for (const id of memberId) {
      if (id === userId) {
        continue;
      }
      const isAlreadyGroupMember =
        await this.orgGroupMemberService.isAlreadyGroupMemberExists({
          groupId,
          memberId: id,
        });
      if (!isAlreadyGroupMember) {
        validMemberIds.push(id);
      }
    }

    if (validMemberIds.length === 0) {
      throw new UnauthorizedException('No valid member IDs to add');
    }

    const insertMultipleMembers = validMemberIds.map((id) => ({
      groupId,
      memberId: id,
    }));
    const member = await this.orgGroupMemberService.addMultipleOrgGroupMembers(
      insertMultipleMembers,
    );
    return { message: 'Members  Added To Org  Group successfully' };
  }
  @Post('add/group-admin')
  @ApiOperation({ summary: 'Add Member As Group Admin' })
  @UseGuards(AuthGuard, AddOrgMemberToAdminForGroupGuard)
  async makeOrgMemberAdmin(
    @Body() createOrgGroupMemberDto: CreateOrgGroupMemberDto,
  ) {
    const isAlreadyGroupAdminRoleExists =
      await this.orgGroupMemberService.isAlreadyGroupAdminRoleExists(
        createOrgGroupMemberDto,
      );
    if (isAlreadyGroupAdminRoleExists) {
      throw new UnauthorizedException('Member already have admin role!');
    }
    const member = await this.orgGroupMemberService.addOrgMemberAdmin(
      createOrgGroupMemberDto,
    );
    return {
      message: 'Admin Role Added for Group Member',
      member,
    };
  }

  @Post('delete/:groupId')
  @ApiOperation({ summary: 'Remove Multiple Members from Org  Group' })
  @UseGuards(AuthGuard, OrgGroupGuard)
  async removeMemberFromGroup(
    @Param('groupId') groupId: number,
    @Body() memberIds: DeleteMultipleGroupMembersDto,
    @Req() req: any,
  ) {
    const orgs: number[] = req.orgs;
    const userId: number = req.user.id;
    const { memberId } = memberIds;
    const validMemberIds: number[] = [];
    for (const id of memberId) {
      if (id === userId) {
        continue;
      }
      const isAlreadyGroupMember =
        await this.orgGroupMemberService.isAlreadyGroupMemberExists({
          groupId,
          memberId: id,
        });
      if (isAlreadyGroupMember) {
        validMemberIds.push(id);
      }
    }

    if (validMemberIds.length === 0) {
      throw new UnauthorizedException('No valid member IDs to delete');
    }

    const orgGroup = await this.orgGroupService.getGroup(groupId);
    if (!orgGroup) {
      throw new UnauthorizedException('Invalid Org Group');
    }

    if (orgGroup.orgId) {
      const orgMember = await this.orgMemberService.getOrgMembersList(
        orgGroup.orgId,
      );
      if (!orgs.includes(orgMember[0].orgId)) {
        throw new UnauthorizedException('Invalid Org Data');
      }
    } else {
      const group = await this.orgGroupService.getGroup(groupId);
      if (group.createdBy !== userId) {
        throw new UnauthorizedException('Only Owner Can Remove Member');
      }
    }
    await this.orgGroupMemberService.removeMultipleGroupMembers(
      groupId,
      validMemberIds,
    );
    return { message: 'Members Removed from Org Group successfully' };
  }
  @Delete('remove/group/:groupId')
  @ApiOperation({ summary: 'Remove Org Group' })
  @UseGuards(AuthGuard, AddOrgMemberToAdminForGroupGuard)
  async leaveOrgGroup(@Req() req: any, @Param('groupId') groupId: number) {
    const memberId: number = req.user.id;
    const isAlreadyGroupMemberExists =
      await this.orgGroupMemberService.isAlreadyGroupMemberExists({
        groupId,
        memberId,
      });
    if (!isAlreadyGroupMemberExists) {
      throw new NotFoundException('Members Must have  Role To Be Removed!');
    }
    await this.orgGroupMemberService.removeGroupMember(groupId, memberId);
    return {
      message: 'Member Leaved From Group successfully',
    };
  }

  @Delete('remove/group-admin/:groupId/:memberId')
  @ApiOperation({ summary: 'Remove Org Group Admin' })
  @UseGuards(AuthGuard, AddOrgMemberToAdminForGroupGuard)
  async removeGroupAdmin(
    @Param('groupId') groupId: number,
    @Param('memberId') memberId: number,
  ) {
    const isAlreadyGroupAdminRoleExists =
      await this.orgGroupMemberService.isAlreadyGroupAdminRoleExists({
        groupId,
        memberId,
      });
    if (!isAlreadyGroupAdminRoleExists) {
      throw new NotFoundException(
        'Members Must have Admin Role To Be Removed!',
      );
    }
    await this.orgGroupMemberService.removeGroupMember(groupId, memberId);
    return {
      message: 'Role Admin Removed From Member  successfully',
    };
  }
}
