import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateOrgGroupDto, UpdateOrgGroupDto } from './dto/org-group.dto';
import { OrgGroupService } from './org-group.service';
import { OrgGroupGuard } from './org-group.guard';

@ApiTags('Org Groups')
@ApiBearerAuth()
@Controller('org-group')
export class OrgGroupController {
  constructor(private orgGroupService: OrgGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create Org Group' })
  @UseGuards(AuthGuard, OrgGroupGuard)
  async createOrgMember(
    @Body() creCreateOrgGroupDto: CreateOrgGroupDto,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    const userId = req.user.id;
    if (
      creCreateOrgGroupDto.orgId &&
      !orgs.includes(creCreateOrgGroupDto.orgId)
    ) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }
    const isAlreadyGroupExists =
      await this.orgGroupService.isAlreadyGroupExists(creCreateOrgGroupDto);
    if (isAlreadyGroupExists) {
      throw new UnauthorizedException(
        'Member already exists. Try to update or remove member!',
      );
    }
    let group;
    if (creCreateOrgGroupDto.orgId) {
      group = await this.orgGroupService.addOrgGroup(creCreateOrgGroupDto);
      await this.orgGroupService.createFirstTask(
        group.id,
        `Welcome to ${group.name} Group Task`,
        userId,
      );
    } else {
      group = await this.orgGroupService.addOrgGroup(
        creCreateOrgGroupDto,
        userId,
      );
      await this.orgGroupService.createFirstTask(
        group.id,
        `Welcome to ${group.name} Group Task`,
        userId,
      );
    }
    return { message: 'Group Added To Org successfully', group };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Org Group' })
  @UseGuards(AuthGuard, OrgGroupGuard)
  async updateOrgGroup(
    @Param('id') id: string,
    @Body() updateOrgGroupDto: UpdateOrgGroupDto,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    const orgGroup = await this.orgGroupService.getGroup(+id);
    if (orgs.length && orgGroup && !orgs.includes(orgGroup.orgId)) {
      throw new UnauthorizedException('Only Owner can update the group');
    }
    const isAlreadyMemberExists =
      await this.orgGroupService.isAlreadyGroupExists({
        ...updateOrgGroupDto,
        orgId: orgGroup.orgId,
      });
    if (isAlreadyMemberExists) {
      throw new NotFoundException(
        `Org Group With  #${updateOrgGroupDto.name} Name already Exist!`,
      );
    }

    const group = await this.orgGroupService.updateGroup(
      +id,
      updateOrgGroupDto,
    );
    return { message: 'Org Group updated successfully', group };
  }
  @Patch('pin_unpin/:id')
  @ApiOperation({ summary: 'Pin Unpin Org Group' })
  @ApiQuery({ name: 'action', enum: ['pin', 'unpin'] })
  @UseGuards(AuthGuard, OrgGroupGuard)
  async pinUnpinOrgGroup(
    @Param('id') id: string,
    @Query('action') action: string,
    @Req() req: any,
  ) {
    const orgs = req.orgs as number[];
    const orgGroup = await this.orgGroupService.getGroup(+id);
    if (orgs.length && orgGroup && !orgs.includes(orgGroup.orgId)) {
      throw new UnauthorizedException('Only Owner can pin unpin the group');
    }
    if (action !== 'pin' && action !== 'unpin') {
      throw new BadRequestException('Invalid action. Use "pin" or "unpin".');
    }
    const group = await this.orgGroupService.pinUnpinGroup(+id, action);
    return { message: `Org Group updated successfully`, group };
  }

  @Get('search-my-connector-groups')
  @ApiOperation({ summary: 'Search My Connector B2C Groups' })
  @UseGuards(AuthGuard)
  async searchMyConnectorGroups(
    @Req() req: any,
    @Query('search') search?: string,
  ) {
    const ownerId: number = req.user.id;
    // Get My Groups that are connector and i am a member or owner of group

    const groups = await this.orgGroupService.getMyConnectorGroups(
      ownerId,
      search,
    );
    return { groups };
  }

  @Get('my-groups')
  @ApiOperation({ summary: 'Get All My Groups' })
  @UseGuards(AuthGuard)
  async getAllOrgGroups(@Req() req: any) {
    const ownerId: number = req.user.id;
    const groups = await this.orgGroupService.getMyGroupMembers(ownerId);
    return { groups };
  }
  @Get('my-personal-groups')
  @ApiOperation({ summary: 'Get All My Personal Groups' })
  @UseGuards(AuthGuard)
  async getAllPersonalOrgGroups(@Req() req: any) {
    const ownerId: number = req.user.id;
    const mygroups = await this.orgGroupService.getMyPersonalGroups(ownerId);
    return { mygroups };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Group By Id' })
  @UseGuards(AuthGuard)
  async getGroup(@Param('id') id: string) {
    const group = await this.orgGroupService.getGroup(+id);
    return { group };
  }

  @Get('/org/:orgId')
  @ApiOperation({ summary: 'Get Org Groups' })
  @UseGuards(AuthGuard)
  async getAllGroupsByOrgId(@Param('orgId') orgId: string) {
    const orgGroups = await this.orgGroupService.getOrgAllGroups(+orgId);
    return { orgGroups };
  }

  @Get()
  @ApiOperation({ summary: 'Get All Org Groups' })
  @UseGuards(AuthGuard)
  async getAllGroups() {
    const groups = await this.orgGroupService.getAllGroups();
    return { groups };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Org Group' })
  @UseGuards(AuthGuard, OrgGroupGuard)
  async deleteOrgInvite(@Param('id') id: string, @Req() req: any) {
    const orgs = req.orgs as number[];
    const orgGroup = await this.orgGroupService.getGroup(+id);
    if (orgs.length && orgGroup && !orgs.includes(orgGroup.orgId)) {
      throw new UnauthorizedException('Only Owner can Delete the group');
    }

    const deleteGroup = await this.orgGroupService.deleteGroup(+id);
    return { deleteGroup };
  }
}
