import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { UpdateOrgInviteDto } from './dto/org-invite.dto';
import { OrgService } from 'src/org/org.service';

@Injectable()
export class OrgInviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgService: OrgService,
  ) {}

  async isAlreadyInvitationExists(orgId: number, inviteeId: number) {
    return this.prisma.orgInvite.findFirst({
      where: {
        orgId,
        inviteeId,
        status: 'Pending',
      },
    });
  }

  async createInvite(orgId: number, inviteeId: number, ownerId: number) {
    return this.prisma.orgInvite.create({
      data: { orgId, inviteeId, ownerId },
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
        org: {
          select: {
            name: true,
            industry: { select: { name: true } },
            region: { select: { name: true } },
          },
        },
      },
    });
  }
  async getInviteByOrgId(orgId: number) {
    const org = await this.orgService.getOne(orgId);
    const invites = await this.prisma.orgInvite.findMany({
      where: { orgId },
      include: {
        invitee: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });
    return {
      ...org,
      invites,
    };
  }

  async getMyInvites(ownerId: number) {
    const myOrgs = await this.orgService.getMyOrgs(ownerId);
    const data = await Promise.all(
      myOrgs.map(async (org) => {
        const invites = await this.prisma.orgInvite.findMany({
          where: { orgId: org.id },
          include: {
            invitee: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        });
        return { ...org, invites };
      }),
    );
    return data;
  }

  async getMyInvitees(inviteeId: number) {
    return this.prisma.orgInvite.findMany({
      where: { inviteeId },
      include: {
        org: { select: { id: true, name: true } },
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
