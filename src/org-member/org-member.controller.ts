import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateMultipleOrgMemberDto,
  DeleteOrgMembersDto,
  UpdateMemberRoleDto,
  UpdateOrgMemberDto,
} from './dto/org-member.dto';
import { OrgMemberGuard } from './org-member.guard';
import { OrgMemberService } from './org-member.service';

@ApiTags('Org Members')
@ApiBearerAuth()
@Controller('org-member')
export class OrgMemberController {
  constructor(private orgMemberService: OrgMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Add  Multiple Org Member' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async createOrgMember(
    @Body() createOrgMemberDto: CreateMultipleOrgMemberDto,
    @Req() req: any,
  ) {
    const ownerId: number = req.user.id;
    const orgs = req.orgs as number[];
    const { memberId, orgId, role } = createOrgMemberDto;
    if (memberId.length !== role.length) {
      throw new BadRequestException('Invalid Data');
    }
    if (orgs.length && !orgs.includes(orgId)) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }
    if (memberId.length === 1 && memberId[0] === ownerId) {
      throw new UnauthorizedException(
        'User is already the owner of the organization',
      );
    }

    const validMembers = [];
    for (let i = 0; i < memberId.length; i++) {
      if (memberId[i] === ownerId) {
        continue;
      }
      const isAlreadyMemberExists =
        await this.orgMemberService.isAlreadyMemberExists(orgId, memberId[i]);
      if (!isAlreadyMemberExists) {
        validMembers.push({
          memberId: memberId[i],
          role: role ? role[i] : undefined,
        });
      }
    }

    if (validMembers.length === 0) {
      throw new UnauthorizedException(
        'No valid members to add or all members are already exist',
      );
    }

    const createOrgMemberDtoFiltered = {
      orgId,
      memberId: validMembers.map((member) => +member.memberId),
      role: validMembers.map((member) => member.role),
    };

    const members = await this.orgMemberService.addMember(
      createOrgMemberDtoFiltered,
    );
    return { message: 'Members Added TO Org successfully', members };
  }

  @Patch('role/:orgId/:memberId')
  @ApiOperation({ summary: 'Update Org Member Role' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async updateOrgMemberRole(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Body() updateOrgMemberRole: UpdateMemberRoleDto,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    if (orgs.length && !orgs.includes(+orgId)) {
      throw new UnauthorizedException(
        'Only Owner can update the member status or role',
      );
    }
    const isAlreadyMemberExists =
      await this.orgMemberService.isAlreadyMemberExists(+orgId, +memberId);
    if (!isAlreadyMemberExists) {
      throw new NotFoundException('No Member found under Org!');
    }

    const member = await this.orgMemberService.updateMemberRole(
      +orgId,
      +memberId,
      updateOrgMemberRole,
    );
    return { message: 'Member Role updated successfully', member };
  }
  @Patch(':orgId/:memberId')
  @ApiOperation({ summary: 'Update Org Member Details' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async updateOrgMember(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Body() updateOrgMember: UpdateOrgMemberDto,
    @Req() req: any,
  ) {
    const userId = req.user.id as number;
    if (userId !== +memberId) {
      throw new UnauthorizedException('Only Member can update his details');
    }
    const isAlreadyMemberExists =
      await this.orgMemberService.isAlreadyMemberExists(+orgId, +memberId);
    if (!isAlreadyMemberExists) {
      throw new NotFoundException('No Member found under Org!');
    }

    const member = await this.orgMemberService.updateMember(
      +orgId,
      +memberId,
      updateOrgMember,
    );
    return { message: 'Member Data updated successfully', member };
  }

  @Get('my/members')
  @ApiOperation({ summary: 'Get My Orgs With Members' })
  @UseGuards(AuthGuard)
  async getMyOrgMemberByOrgId(@Req() req: any) {
    const ownerId = req.user.id;
    const myOrgs = await this.orgMemberService.getMyOrgMembers(+ownerId);
    return { myOrgs };
  }

  @Get(':orgId/:memberId')
  @ApiOperation({ summary: 'Get Member Data By Org Id & Member Id' })
  @UseGuards(AuthGuard)
  async getMemberData(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
  ) {
    const orgMembers = await this.orgMemberService.getOrgMembers(
      +orgId,
      +memberId,
    );
    return { orgMembers };
  }

  @Get(':orgId')
  @ApiOperation({ summary: 'Get All Members By Org Id' })
  @UseGuards(AuthGuard)
  async getAllMemberByOrgId(@Param('orgId') orgId: string) {
    console.log('orgId', orgId);
    const orgMembers = await this.orgMemberService.getOrgAllMembers(+orgId);
    return { orgMembers };
  }
  @Get('org/:orgId/search')
  @ApiOperation({ summary: 'Search Org Members by Username' })
  @UseGuards(AuthGuard)
  async searchAllOrgMember(
    @Param('orgId') orgId: string,
    @Query('search') search: string,
  ) {
    const searchResult = await this.orgMemberService.searchOrgMembers(
      +orgId,
      search,
    );
    return { searchResult };
  }
  @Get('group/:groupId/search')
  @ApiOperation({ summary: 'Search Group Members by Username' })
  @UseGuards(AuthGuard)
  async searchAllGroupMember(
    @Param('groupId') groupId: string,
    @Query('search') search: string,
  ) {
    const groupMemberResult = await this.orgMemberService.searchGroupMembers(
      +groupId,
      search,
    );
    return { groupMemberResult };
  }

  @Post('delete/:orgId')
  @ApiOperation({ summary: 'Delete Members By Org Id & Member Ids' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async deleteOrgMembers(
    @Param('orgId') orgId: string,
    @Body() members: DeleteOrgMembersDto,
    @Req() req: any,
  ) {
    const ownerId = req.user.id;
    const orgs = req.orgs as number[];
    if (orgs.length && !orgs.includes(+orgId)) {
      throw new UnauthorizedException('Only Org Owner Can Delete Member');
    }
    const memberIds = members.memberId;

    if (memberIds.includes(ownerId)) {
      throw new UnauthorizedException('Owner cannot delete himself');
    }
    const deleteMember = await this.orgMemberService.deleteMembers(
      +orgId,
      memberIds,
    );
    return { message: ` ${deleteMember.count} Members deleted successfully` };
  }
}
