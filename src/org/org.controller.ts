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
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto, UpdateOrgDto } from './dto/org.dto';
import { AuthGuard } from '../auth/auth.guard';
import { MinioService } from '../minio/minio.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('Organization')
@ApiBearerAuth()
@Controller('organization')
export class OrgController {
  private readonly bucketName = 'private';
  constructor(
    private readonly orgService: OrgService,
    private readonly minioService: MinioService,
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
    const organization = await this.orgService.createOrg(
      ownerId,
      createOrgDto,
      logoUrl,
    );

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

  @Get('my')
  @ApiOperation({ summary: 'Get My Organization' })
  @UseGuards(AuthGuard)
  async getMyOrgs(@Req() req) {
    const ownerId = req.user.id;
    return this.orgService.getMyOrgs(+ownerId);
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
