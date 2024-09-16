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
// import { OrgGroupMembersGuard } from './org-group-members.guard';
import { OrgGroupMembersService } from './org-group-members.service';
import { OrgGroupMembersGuard } from './org-group-members.guard';
import { OrgGroupGuard } from 'src/org-group/org-group.guard';
import { OrgMemberService } from 'src/org-member/org-member.service';

@ApiTags('Org Group Members')
@ApiBearerAuth()
@Controller('org-group-members')
export class OrgGroupMembersController {
  constructor(
    private readonly orgGroupMemberService: OrgGroupMembersService,
    private readonly orgMemberService: OrgMemberService,
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
    const orgMember = await this.orgMemberService.getOrgMember(memberId);

    if (!orgMember) {
      throw new NotFoundException('Invalid Member');
    }
    if (!orgs.includes(orgMember.orgId)) {
      throw new UnauthorizedException('Invalid Org Data');
    }
    await this.orgGroupMemberService.removeGroupMember(groupId, memberId);
    return { message: 'Member Removed from Org Group successfully' };
  }
}
