import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto, UpdateOrgDto } from './dto/org.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrgMemberService } from 'src/org-member/org-member.service';
import { OrgMemberStatus } from 'src/org-member/dto/org-member.dto';
@ApiTags('Organization')
@ApiBearerAuth()
@Controller('organization')
export class OrgController {
  private readonly bucketName = 'private';
  constructor(
    private readonly orgService: OrgService,
    private readonly orgMemberService: OrgMemberService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Organization' })
  @UseGuards(AuthGuard)
  // @UseInterceptors(FileInterceptor('logo'))
  async createOrganization(
    @Body() createOrgDto: CreateOrgDto,
    // @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    let logoUrl = null;
    // if (file) {
    //   logoUrl = await this.minioService.uploadFile(file, this.bucketName);
    // }

    const ownerId = req.user.id;
    const { members, ...createOrgDtoData } = createOrgDto;
    const organization = await this.orgService.createOrg(
      ownerId,
      createOrgDtoData,
      logoUrl,
    );
    const membersToAdd = members.filter((memberId) => memberId !== ownerId);
    if (membersToAdd.length) {
      await Promise.all(
        membersToAdd.map((memberId) =>
          this.orgMemberService.addMember({
            orgId: organization.id,
            memberId: [memberId],
            role: [OrgMemberStatus.Member],
          }),
        ),
      );
    }

    return { message: 'Organization created successfully', org: organization };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Organization' })
  @UseGuards(AuthGuard)
  // @UseInterceptors(FileInterceptor('logo'))
  async updateOrganization(
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrgDto,
    // @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    // let logoUrl = null;
    // if (file) {
    //   logoUrl = await this.minioService.uploadFile(file, this.bucketName);
    // }
    const ownerId = req.user.id;

    const organization = await this.orgService.updateOrg(
      +id,
      ownerId,
      updateOrgDto,
    );

    return { message: 'Organization updated successfully', org: organization };
  }
  @Get()
  @ApiOperation({ summary: 'Get All Organization' })
  @UseGuards(AuthGuard)
  async getAll() {
    return this.orgService.getAllOrgs();
  }
  @Get('search')
  @ApiOperation({ summary: 'Search Organization' })
  @UseGuards(AuthGuard)
  async searchOrgs(@Query('search') search: string) {
    return this.orgService.searchOrg(search);
  }
  @Get('my')
  @ApiOperation({ summary: 'Get My Organization' })
  @UseGuards(AuthGuard)
  async getMyOrgs(@Req() req) {
    const ownerId = req.user.id;
    return this.orgService.getAllMyOrgs(+ownerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Organization By Id' })
  @UseGuards(AuthGuard)
  async getOne(@Param('id') id: string) {
    return this.orgService.getOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Organization By Id' })
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string, @Req() req) {
    const ownerId = req.user.id;
    return this.orgService.deleteOrg(+id, +ownerId);
  }
}
