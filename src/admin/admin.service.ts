import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateAdminDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdmin(userAdmin: CreateAdminDto) {
    return this.prisma.userAdmin.create({ data: userAdmin });
  }
  async removeAdmin(userId: number) {
    return this.prisma.userAdmin.delete({
      where: { userId },
    });
  }

  async getAllAdmins() {
    return this.prisma.userAdmin.findMany({ include: { admin: true } });
  }
  async getAdmins(userId: number) {
    return this.prisma.userAdmin.findFirst({
      where: { userId },
    });
  }
}
