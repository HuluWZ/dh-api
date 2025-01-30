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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto, UpdateCatalogDto } from './dto/catalog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioFileUploadService } from 'src/minio/minio.service';
import { OrgGroupGuard } from 'src/org-group/org-group.guard';

@ApiTags('Catalog')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly minioService: MinioFileUploadService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create Catalog' })
  @UseGuards(AuthGuard, OrgGroupGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file')) // Apply the FileInterceptor
  async createCatalog(
    @Body() createPollDto: CreateCatalogDto,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File, // Get the uploaded file
  ) {
    const orgs = req.orgs as number[];
    if (createPollDto.orgId && !orgs.includes(createPollDto.orgId)) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }

    if (!file) {
      throw new NotFoundException('File not found');
    }
    const { path } = await this.minioService.uploadSingleFile(file, 'public');
    if (!path) {
      throw new NotFoundException('File not uploaded');
    }

    const catalog = await this.catalogService.createCatalog(
      createPollDto,
      path,
    );
    return catalog;
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update Catalog' })
  @UseGuards(AuthGuard, OrgGroupGuard)
  async updateCatalog(
    @Req() req: any,
    @Param('id') id: number,
    @Body() updateCatalogDto: UpdateCatalogDto,
  ) {
    const orgs = req.orgs as number[];
    const catalog = await this.catalogService.getCatalogById(id);
    if (!catalog) {
      throw new NotFoundException('Catalog not found');
    }
    if (catalog.orgId && !orgs.includes(catalog.orgId)) {
      throw new UnauthorizedException('You are not the owner of the Org');
    }
    return this.catalogService.updateCatalog(id, updateCatalogDto);
  }
  @Get()
  @ApiOperation({ summary: 'Get All Catalogs' })
  @UseGuards(AuthGuard)
  async getAllCatalog() {
    return this.catalogService.getCatalogs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Catalog By Id' })
  @UseGuards(AuthGuard)
  async getCatalog(@Param('id') id: number) {
    return this.catalogService.getCatalogById(id);
  }
  @Get(':orgId')
  @ApiOperation({ summary: 'Get Catalog By Org Id' })
  @UseGuards(AuthGuard)
  async getCatalogByOrgId(@Param('orgId') orgId: number) {
    return this.catalogService.getCatalogByOrgId(orgId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Catalog By Id' })
  @UseGuards(AuthGuard)
  async deletePoll(@Req() req, @Param('id') id: number) {
    return this.catalogService.deleteCatalog(id);
  }
}
