import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OrgInviteService } from './org-invite.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateOrgInviteDto } from './dto/org-invite.dto';
import { OrgInviteGuard } from './org-invite.guard';
import { OrgMemberService } from 'src/org-member/org-member.service';
import { OrgMemberStatus } from 'src/org-member/dto/org-member.dto';
import { OrgInviteStatus } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrgService } from 'src/org/org.service';
import { NotificationService } from 'src/notification/notification.service';
import { DeviceService } from 'src/common/device/device.service';

@ApiTags('Org Join Invitation')
@ApiBearerAuth()
@Controller('org-invite')
export class OrgInviteController {
  constructor(
    private orgInviteService: OrgInviteService,
    private orgMemberService: OrgMemberService,
    private orgService: OrgService,
    private notificationService: NotificationService,
    private deviceService: DeviceService,
  ) {}

  @Post(':orgId')
  @ApiOperation({ summary: 'Create Org  Join Invite' })
  @UseGuards(AuthGuard)
  async createOrgInvite(@Param('orgId') orgId: string, @Req() req: any) {
    const inviteeId: number = req.user.id;
    const invitee = req.user;
    const isAlreadyInvitationExists =
      await this.orgInviteService.isAlreadyInvitationExists(+orgId, inviteeId);
    if (isAlreadyInvitationExists) {
      throw new UnauthorizedException(
        'Invitation already exists. Wait Until Org Owner Approves it!',
      );
    }
    const org = await this.orgService.getOne(+orgId);
    const invite = await this.orgInviteService.createInvite(
      +orgId,
      +inviteeId,
      +org.ownerId,
    );
    const device = await this.deviceService.findDeviceByUserId(+org.ownerId);
    if (device && device.deviceId) {
      const message = {
        token: device.deviceId,
        title: `New Invitation to Join Org #${org.name} Requested`,
        body: `View The Invitation from ${invitee?.firstName}. And Approve or Reject The Request`,
        icon: 'https://example.com/icon.png',
      };
      await this.notificationService.sendNotification(message, +org.ownerId);
    }
    console.log('invite', invite, device.deviceId, org.ownerId);
    return { message: 'Invitation created successfully', invite };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Org Join Invite Status' })
  @UseGuards(AuthGuard, OrgInviteGuard)
  async updateOrgInvite(
    @Param('id') id: string,
    @Body() updateOrgInvite: UpdateOrgInviteDto,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    const getInvite = await this.orgInviteService.getInvite(+id);

    if (orgs.length && !orgs.includes(+getInvite.orgId)) {
      throw new UnauthorizedException('Only Owner can update the invitation');
    }
    const invite = await this.orgInviteService.updateInvite(
      +id,
      updateOrgInvite,
    );
    if (updateOrgInvite.status === OrgInviteStatus.Approved) {
      await this.orgMemberService.addMember({
        memberId: +getInvite.inviteeId,
        orgId: +getInvite.orgId,
        role: OrgMemberStatus.Member,
      });
      await this.orgInviteService.deleteInvite(+id, getInvite.ownerId);
      // Send Notification to Invitee
      const device = await this.deviceService.findDeviceByUserId(
        +getInvite.inviteeId,
      );
      if (device && device.deviceId) {
        const message = {
          token: device.deviceId,
          title: `Invitation to Join Org #${getInvite.org.name} Approved`,
          body: `Welcome ${getInvite.invitee.firstName}. From now on You are now a member of the organization ${getInvite.org.name}`,
          icon: 'https://example.com/icon.png',
        };
        await this.notificationService.sendNotification(
          message,
          +getInvite.inviteeId,
        );
      }
    }
    console.log('invite', invite);

    return { message: 'Invitation updated successfully', invite };
  }
  @Get()
  @ApiOperation({ summary: 'Get All Join Invitation' })
  @UseGuards(AuthGuard)
  async getAll() {
    return this.orgInviteService.getAllInvite();
  }
  @Get(':orgId')
  @ApiOperation({ summary: 'Get Org Join Invite By orgId' })
  @UseGuards(AuthGuard)
  async getOrgInviteByOrgId(@Param('orgId') orgId: string) {
    const invite = await this.orgInviteService.getInviteByOrgId(+orgId);
    return { invite };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Org Join Invite By Id' })
  @UseGuards(AuthGuard)
  async getOrgInviteById(@Param('id') id: string) {
    const invite = await this.orgInviteService.getInvite(+id);
    return { invite };
  }
  @Get('my/invites')
  @ApiOperation({ summary: 'Get My Orgs Join Invites' })
  @UseGuards(AuthGuard)
  async getMyOrgInvites(@Req() req: any) {
    const ownerId = req.user.id;
    const invite = await this.orgInviteService.getMyInvites(+ownerId);
    return { invite };
  }
  @Get('my/invitees')
  @ApiOperation({ summary: 'Get My Org Join Invitees' })
  @UseGuards(OrgInviteGuard)
  @UseGuards(AuthGuard)
  async getMyOrgInvitees(@Req() req: any) {
    const inviteeId = req.user.id;
    const invite = await this.orgInviteService.getMyInvitees(+inviteeId);
    return { invite };
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Org Join Invite By Id' })
  @UseGuards(AuthGuard, OrgInviteGuard)
  async deleteOrgInvite(@Param('id') id: string, @Req() req: any) {
    const ownerId = req.user.id as number;
    const orgs = req.orgs as number[];
    //  check if user is the owner
    if (orgs.length && !orgs.includes(+id)) {
      throw new UnauthorizedException('Only Owner can delete the invitation');
    }
    const invite = await this.orgInviteService.deleteInvite(+id, ownerId);
    return { invite };
  }
}
