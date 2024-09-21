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
    if (orgs.length && !orgs.includes(creCreateOrgGroupDto.orgId)) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }
    const isAlreadyGroupExists =
      await this.orgGroupService.isAlreadyGroupExists(creCreateOrgGroupDto);
    if (isAlreadyGroupExists) {
      throw new UnauthorizedException(
        'Member already exists. Try to update or remove member!',
      );
    }
    const group = await this.orgGroupService.addOrgGroup(creCreateOrgGroupDto);
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
  @Get('my-groups')
  @ApiOperation({ summary: 'Get All My Org Groups' })
  @UseGuards(AuthGuard)
  async getAllOrgGroups(@Req() req: any) {
    const ownerId: number = req.user.id;
    const groups = await this.orgGroupService.getMyOrgMembers(ownerId);
    return { groups };
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
