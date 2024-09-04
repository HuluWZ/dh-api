import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateOrgInviteDto, UpdateOrgInviteDto } from './dto/org-invite.dto';

@Injectable()
export class OrgInviteService {
  constructor(private readonly prisma: PrismaService) {}

  async isAlreadyInvitationExists(createOrgInviteDto: CreateOrgInviteDto) {
    return this.prisma.orgInvite.findFirst({
      where: {
        orgId: createOrgInviteDto.orgId,
        inviteeId: createOrgInviteDto.inviteeId,
        status: { not: 'Pending' },
      },
    });
  }

  async createInvite(createOrgInviteDto: CreateOrgInviteDto, ownerId: number) {
    return this.prisma.orgInvite.create({
      data: { ...createOrgInviteDto, ownerId },
    });
  }

  async updateInvite(id: number, updateOrgInviteDto: UpdateOrgInviteDto) {
    return this.prisma.orgInvite.update({
      where: { id },
      data: { ...updateOrgInviteDto },
    });
  }
  async getAllInvite() {
    return this.prisma.orgInvite.findMany({
      include: {
        org: {
          select: {
            name: true,
            industry: { select: { name: true } },
            region: { select: { name: true } },
          },
        },
        invitee: { select: { firstName: true, lastName: true, phone: true } },
        owner: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }

  async getInvite(id: number) {
    return this.prisma.orgInvite.findUnique({
      where: { id },
      include: {
        invitee: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }

  async getMyInvites(ownerId: number) {
    return this.prisma.orgInvite.findMany({
      where: { ownerId },
      include: {
        invitee: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }

  async getMyInvitees(inviteeId: number) {
    return this.prisma.orgInvite.findMany({
      where: { inviteeId },
      include: {
        invitee: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }

  async deleteInvite(id: number, ownerId: number) {
    const invite = await this.prisma.org.findUnique({
      where: { id },
    });

    if (!invite) {
      throw new NotFoundException(`Org Invite with ID ${id} not found`);
    }

    if (invite.ownerId !== ownerId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this organization',
      );
    }

    return this.prisma.orgInvite.delete({ where: { id } });
  }
}
