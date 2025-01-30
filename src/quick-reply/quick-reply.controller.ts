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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateQuickReplyDto,
  UpdateQuickReplyDto,
} from './dto/quick-reply.dto';
import { QuickReplyService } from './quick-reply.service';

@ApiTags('Quick Reply')
@ApiBearerAuth()
@Controller('quick-reply')
export class QuickReplyController {
  constructor(private readonly quickReplyService: QuickReplyService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create Quick Reply' })
  @UseGuards(AuthGuard)
  async createQuickReply(
    @Req() req: any,
    @Body() createReplyDto: CreateQuickReplyDto,
  ) {
    const userId: number = req.user.id;
    const isExist = await this.quickReplyService.isQuickReplyAlreadyExist(
      createReplyDto.shortcut,
      userId,
    );
    if (isExist) {
      throw new UnauthorizedException('Quick Reply shortcut already exist');
    }
    const catalog = await this.quickReplyService.createQuickReply(
      createReplyDto,
      userId,
    );
    return catalog;
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update Quick Reply' })
  @UseGuards(AuthGuard)
  async updateQuickReply(
    @Req() req: any,
    @Param('id') id: number,
    @Body() updateQuickReplyDto: UpdateQuickReplyDto,
  ) {
    const userId: number = req.user.id;
    const reply = await this.quickReplyService.getQuickReplyById(id);
    if (reply.userId !== userId) {
      throw new UnauthorizedException(
        'You are not the owner of the Quick Reply',
      );
    }
    return this.quickReplyService.updateCatalog(id, updateQuickReplyDto);
  }
  @Get()
  @ApiOperation({ summary: 'Get All Catalogs' })
  @UseGuards(AuthGuard)
  async getAllCatalog() {
    return this.quickReplyService.getAllQuickReply();
  }
  @Get('my')
  @ApiOperation({ summary: 'Get My Quick Reply' })
  @UseGuards(AuthGuard)
  async getMyQuickReply(@Req() req: any) {
    const userId: number = req.user.id;
    return this.quickReplyService.getQuickReplyByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Catalog By Id' })
  @UseGuards(AuthGuard)
  async getQuickReply(@Param('id') id: number) {
    return this.quickReplyService.getQuickReplyById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Quick Reply By Id' })
  @UseGuards(AuthGuard)
  async deleteQuickReply(@Req() req, @Param('id') id: number) {
    const userId: number = req.user.id;
    const reply = await this.quickReplyService.getQuickReplyById(id);
    if (reply.userId !== userId) {
      throw new UnauthorizedException(
        'You are not the owner of the Quick Reply',
      );
    }
    return this.quickReplyService.deleteQuickReply(id);
  }
}
