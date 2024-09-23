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
import { CreateOrgGroupMemberDto } from './dto/org-group-members.dto';
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
  @ApiOperation({ summary: 'Add Org Member To Group' })
  @UseGuards(AuthGuard, OrgGroupMembersGuard)
  async addOrgMemberToGroup(
    @Body() createOrgGroupMemberDto: CreateOrgGroupMemberDto,
    @Req() req: any,
  ) {
    const orgs: number[] = req.orgs;
    const orgId = req.orgId;

    if (!orgs.includes(orgId)) {
      throw new UnauthorizedException('Invalid Org Data');
    }
    const isAlreadyGroupMemberExists =
      await this.orgGroupMemberService.isAlreadyGroupMemberExists(
        createOrgGroupMemberDto,
      );
    if (isAlreadyGroupMemberExists) {
      throw new UnauthorizedException(
        'Member already exists in Groups. Try to update or remove member!',
      );
    }
    const member = await this.orgGroupMemberService.addOrgGroupMember(
      createOrgGroupMemberDto,
    );
    return { message: 'Member  Added To Org  Group successfully', member };
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

  @Delete(':groupId/:memberId')
  @ApiOperation({ summary: 'Remove Member from Org  Group' })
  @UseGuards(AuthGuard, OrgGroupGuard)
  async removeMemberFromGroup(
    @Param('groupId') groupId: number,
    @Param('memberId') memberId: number,
    @Req() req: any,
  ) {
    const orgs: number[] = req.orgs;
    const isAlreadyGroupMemberExists =
      await this.orgGroupMemberService.isAlreadyGroupMemberExists({
        groupId,
        memberId,
      });
    if (!isAlreadyGroupMemberExists) {
      throw new NotFoundException('Member not found in the Group');
    }
    const orgGroup = await this.orgGroupService.getGroup(groupId);
    if (!orgGroup) {
      throw new UnauthorizedException('Invalid Org Group');
    }

    const orgMember = await this.orgMemberService.getOrgMember(
      memberId,
      orgGroup.orgId,
    );
    if (!orgMember) {
      throw new NotFoundException('Invalid Member');
    }
    if (!orgs.includes(orgMember.orgId)) {
      throw new UnauthorizedException('Invalid Org Data');
    }
    await this.orgGroupMemberService.removeGroupMember(groupId, memberId);
    return { message: 'Member Removed from Org Group successfully' };
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
