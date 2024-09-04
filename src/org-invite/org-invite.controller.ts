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
import { CreateOrgInviteDto, UpdateOrgInviteDto } from './dto/org-invite.dto';
import { OrgInviteGuard } from './org-invite.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Org Invite')
@ApiBearerAuth()
@Controller('org-invite')
export class OrgInviteController {
  constructor(private orgInviteService: OrgInviteService) {}

  @Post()
  @ApiOperation({ summary: 'Create Org Invite' })
  @UseGuards(AuthGuard, OrgInviteGuard)
  async createOrgInvite(
    @Body() createOrgInviteDto: CreateOrgInviteDto,
    @Req() req: any,
  ) {
    const ownerId: number = req.user.id;
    const orgs = req.orgs as number[];
    if (createOrgInviteDto.inviteeId === ownerId) {
      throw new UnauthorizedException("Owner can't Invite themselves");
    }
    if (orgs.length && !orgs.includes(createOrgInviteDto.orgId)) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }
    const isAlreadyInvitationExists =
      this.orgInviteService.isAlreadyInvitationExists(createOrgInviteDto);
    if (isAlreadyInvitationExists) {
      throw new UnauthorizedException(
        'Invitation already exists. Try to update the status!',
      );
    }
    const invite = await this.orgInviteService.createInvite(
      createOrgInviteDto,
      ownerId,
    );
    return { message: 'Invitation created successfully', invite };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Org Invite' })
  @UseGuards(AuthGuard, OrgInviteGuard)
  async updateOrgInvite(
    @Param('id') id: string,
    @Body() updateOrgInvite: UpdateOrgInviteDto,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    if (orgs.length && !orgs.includes(+id)) {
      throw new UnauthorizedException('Only Owner can update the invitation');
    }
    const invite = await this.orgInviteService.updateInvite(
      +id,
      updateOrgInvite,
    );
    return { message: 'Invitation updated successfully', invite };
  }
  @Get()
  @ApiOperation({ summary: 'Get All Invitation' })
  @UseGuards(AuthGuard)
  async getAll() {
    return this.orgInviteService.getAllInvite();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Org Invite By Id' })
  @UseGuards(AuthGuard)
  async getOrgInviteById(@Param('id') id: string) {
    const invite = await this.orgInviteService.getInvite(+id);
    return { invite };
  }
  @Get('my/invites')
  @ApiOperation({ summary: 'Get My  Org Invites' })
  @UseGuards(AuthGuard)
  async getMyOrgInvites(@Req() req: any) {
    const ownerId = req.user.id;
    const invite = await this.orgInviteService.getMyInvites(+ownerId);
    return { invite };
  }
  @Get('my/invitees')
  @ApiOperation({ summary: 'Get My  Org Invitees' })
  @UseGuards(OrgInviteGuard)
  @UseGuards(AuthGuard)
  async getMyOrgInvitees(@Req() req: any) {
    const ownerId = req.user.id;
    const invite = await this.orgInviteService.getMyInvitees(+ownerId);
    return { invite };
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Org Invite By Id' })
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
