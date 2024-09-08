import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateOrgMemberDto, UpdateOrgMemberDto } from './dto/org-member.dto';
import { OrgMemberService } from './org-member.service';
import { OrgMemberGuard } from './org-member.guard';

@ApiTags('Org Members')
@ApiBearerAuth()
@Controller('org-member')
export class OrgMemberController {
  constructor(private orgMemberService: OrgMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Add Org Member' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async createOrgMember(
    @Body() createOrgMemberDto: CreateOrgMemberDto,
    @Req() req: any,
  ) {
    const ownerId: number = req.user.id;
    const orgs = req.orgs as number[];
    const { memberId, orgId } = createOrgMemberDto;
    if (memberId === ownerId) {
      throw new UnauthorizedException(
        'User is already the owner of the organization',
      );
    }
    if (orgs.length && !orgs.includes(orgId)) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }
    const isAlreadyMemberExists = this.orgMemberService.isAlreadyMemberExists(
      orgId,
      memberId,
    );
    if (isAlreadyMemberExists) {
      throw new UnauthorizedException(
        'Member already exists. Try to update or remove member!',
      );
    }
    const member = await this.orgMemberService.addMember(createOrgMemberDto);
    return { message: 'Member Added TO Org successfully', member };
  }

  @Patch(':orgId/:memberId')
  @ApiOperation({ summary: 'Update Org Member' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async updateOrgMember(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Body() updateOrgMember: UpdateOrgMemberDto,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    if (orgs.length && !orgs.includes(+orgId)) {
      throw new UnauthorizedException(
        'Only Owner can update the member status or role',
      );
    }
    const isAlreadyMemberExists = this.orgMemberService.isAlreadyMemberExists(
      +orgId,
      +memberId,
    );
    if (!isAlreadyMemberExists) {
      throw new NotFoundException('No Member found under Org!');
    }

    const member = await this.orgMemberService.updateMember(
      +orgId,
      +memberId,
      updateOrgMember,
    );
    return { message: 'Member Role updated successfully', member };
  }
  @Get(':orgId/:memberId')
  @ApiOperation({ summary: 'Get Member Data By Org Id & Member Id' })
  @UseGuards(AuthGuard)
  async getMemberData(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
  ) {
    const member = await this.orgMemberService.getOrgMembers(+orgId, +memberId);
    return { member };
  }

  @Get(':orgId')
  @ApiOperation({ summary: 'Get All Members By Org Id' })
  @UseGuards(AuthGuard)
  async getAllMemberByOrgId(@Param('orgId') orgId: string) {
    const members = await this.orgMemberService.getOrgAllMembers(+orgId);
    return { members };
  }

  @Get('my/members')
  @ApiOperation({ summary: 'Get My Orgs With Members' })
  @UseGuards(AuthGuard)
  async getMyOrgMemberByOrgId(@Req() req: any) {
    const ownerId = req.user.id;
    const myOrgs = await this.orgMemberService.getMyOrgMembers(+ownerId);
    return { myOrgs };
  }

  @Delete(':orgId/:memberId')
  @ApiOperation({ summary: 'Delete Member By Org Id & Member Id' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async deleteOrgInvite(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    if (orgs.length && !orgs.includes(+orgId)) {
      throw new UnauthorizedException('Only Org Owner Can Delete Member');
    }
    const deleteMember = await this.orgMemberService.deleteMember(
      +orgId,
      +memberId,
    );
    return { deleteMember };
  }
}
