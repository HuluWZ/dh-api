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
  CreateOrgMemberWithCustomersDto,
  CreateOrgMemberWithPhoneNoDto,
  DeleteOrgMembersDto,
  UpdateMemberRoleDto,
  UpdateOrgMemberDto,
} from './dto/org-member.dto';
import { OrgMemberGuard } from './org-member.guard';
import { OrgMemberService } from './org-member.service';
import { AuthService } from 'src/auth/auth.service';
import phone from 'phone';
import { OrgInviteService } from 'src/org-invite/org-invite.service';
import { OrgService } from 'src/org/org.service';

@ApiTags('Org Members')
@ApiBearerAuth()
@Controller('org-member')
export class OrgMemberController {
  constructor(
    private orgMemberService: OrgMemberService,
    private readonly authService: AuthService,
    private readonly orgService: OrgService,
  ) {}

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
  @Post('add-multiple-members')
  @ApiOperation({ summary: 'Add Multiple Members By Phone Numbers' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async addMultipleMemberFromPhone(
    @Body() createCustomerPhoneNoDto: CreateOrgMemberWithPhoneNoDto,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    const ownerId: number = req.user.id;
    const { orgId, phone_numbers } = createCustomerPhoneNoDto;
    if (orgs.length && !orgs.includes(orgId)) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }
    const org = await this.orgService.getOne(orgId);
    if (!org) {
      throw new NotFoundException('Org not found');
    }
    const validPhoneNumbers = phone_numbers
      .map((phone_number) => {
        const { isValid, phoneNumber } = phone(phone_number);
        return isValid ? phoneNumber : null;
      })
      .filter((phoneNumber) => phoneNumber !== null);
    if (validPhoneNumbers.length === 0) {
      throw new BadRequestException('All provided phone numbers are invalid');
    }
    const registeredUsers = await Promise.all(
      validPhoneNumbers.map((phoneNumber) =>
        this.authService.findUserByPhone(phoneNumber),
      ),
    );
    const existingUsers = registeredUsers.filter((user) => user !== null);
    const newPhoneNumbers = validPhoneNumbers.filter(
      (_, index) => !registeredUsers[index],
    );

    const existingUserIds = await Promise.all(
      existingUsers.map(async (user) => {
        const isAlreadyPendingInvitation =
          await this.orgMemberService.isAlreadyInvitationExists(orgId, user.id);
        return isAlreadyPendingInvitation ? null : user.id;
      }),
    ).then((ids) => ids.filter((id) => id !== null));

    const newUsers = await Promise.all(
      newPhoneNumbers.map((phoneNumber) =>
        this.authService.createUserWithPhone(phoneNumber),
      ),
    );

    const newUserIds = newUsers.map((user) => user.id);

    if (newUserIds.length > 0) {
      await this.orgMemberService.createMultipleInvite(
        orgId,
        ownerId,
        newUserIds,
        org.name,
      );
    }
    if (newUserIds.length == 0 && existingUserIds.length == 0) {
      throw new BadRequestException('All Members are already invited');
    }
    return {
      message: `${existingUserIds.length + newUserIds.length} Members Invited  TO Org successfully`,
      members: [...existingUserIds, ...newUserIds],
    };
  }
  @Post('add-connector')
  @ApiOperation({ summary: 'Add Connector as Org Member' })
  @UseGuards(AuthGuard, OrgMemberGuard)
  async addConnectorAsMember(
    @Body() createCustomerMemberDto: CreateOrgMemberWithCustomersDto,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    const { orgId, phone_number } = createCustomerMemberDto;
    if (orgs.length && !orgs.includes(orgId)) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }
    const { isValid, phoneNumber } = phone(phone_number);
    if (!isValid) {
      throw new BadRequestException(`Invalid Phone Number ${phone_number}.`);
    }

    const isUserAlreadyExist =
      await this.authService.findUserByPhone(phoneNumber);
    if (isUserAlreadyExist) {
      const isAlreadyMemberExists =
        await this.orgMemberService.isAlreadyMemberExists(
          orgId,
          isUserAlreadyExist.id,
        );
      if (isAlreadyMemberExists) {
        throw new NotFoundException(
          'User is already a member of the organization',
        );
      }
      const member = await this.orgMemberService.addMemberForCustomer(
        orgId,
        isUserAlreadyExist.id,
      );
      return { message: 'Connector Added TO Org successfully', member };
    } else {
      const user = await this.authService.createUserWithPhone(phoneNumber);
      const member = await this.orgMemberService.addMemberForCustomer(
        orgId,
        user.id,
      );
      return { message: 'Connector Added TO Org successfully', member };
    }
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
