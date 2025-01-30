import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import {
  CreateQuickReplyDto,
  UpdateQuickReplyDto,
} from './dto/quick-reply.dto';

@Injectable()
export class QuickReplyService {
  constructor(private readonly prismaService: PrismaService) {}

  isQuickReplyAlreadyExist(shortcut: string, userId: number) {
    return this.prismaService.quickReply.findUnique({
      where: { userId_shortcut: { userId, shortcut } },
    });
  }

  async createQuickReply(createReplyDto: CreateQuickReplyDto, userId: number) {
    return this.prismaService.quickReply.create({
      data: { ...createReplyDto, userId },
    });
  }

  getAllQuickReply() {
    return this.prismaService.quickReply.findMany({ include: { user: true } });
  }

  getQuickReplyById(id: number) {
    return this.prismaService.quickReply.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  getQuickReplyByUserId(userId: number) {
    return this.prismaService.quickReply.findMany({
      where: { userId },
      include: { user: true },
    });
  }

  deleteQuickReply(id: number) {
    return this.prismaService.quickReply.delete({ where: { id } });
  }

  updateCatalog(id: number, updateQuickReplyDto: UpdateQuickReplyDto) {
    return this.prismaService.quickReply.update({
      where: { id },
      data: { ...updateQuickReplyDto },
    });
  }
}
