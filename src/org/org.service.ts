import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOrgDto,
  CreateOrgOwnershipTransfer,
  UpdateOrgDto,
  UpdateOrgOwnershipTransferStatus,
} from './dto/org.dto';
import { Org } from '@prisma/client';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrg(
    ownerId: number,
    createOrgDto: Omit<CreateOrgDto, 'members'>,
    logoUrl?: string,
  ) {
    return this.prisma.org.create({
      data: {
        ...createOrgDto,
        logo: logoUrl || null,
        ownerId,
      },
    });
  }

  async getAllOrgs(): Promise<Org[]> {
    return this.prisma.org.findMany({
      include: {
        industry: { select: { name: true, isActive: true } },
        region: { select: { name: true, isActive: true } },
      },
    });
  }

  async getOne(id: number) {
    const org = await this.prisma.org.findUnique({
      where: { id },
      include: {
        owner: { select: { firstName: true, lastName: true, phone: true } },
        industry: { select: { name: true, isActive: true } },
        region: { select: { name: true, isActive: true } },
      },
    });
    if (!org) {
      throw new NotFoundException(`Org with ID ${id} not found`);
    }
    const members = await this.prisma.orgMember.findMany({
      where: { orgId: id },
      include: {
        member: {
          select: { firstName: true, lastName: true, phone: true },
        },
      },
    });
    const groups = await this.prisma.orgGroup.findMany({
      where: { orgId: id },
      include: {
        OrgGroupMember: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    return { ...org, members, groups };
  }

  async getMyOrgs(ownerId: number): Promise<Org[]> {
    return this.prisma.org.findMany({
      where: { ownerId },
      include: {
        industry: { select: { name: true, isActive: true } },
        region: { select: { name: true, isActive: true } },
      },
    });
  }
  async getAllMyOrgs(ownerId: number) {
    const myOrgs = await this.prisma.org.findMany({
      where: { ownerId },
      include: {
        industry: { select: { name: true, isActive: true } },
        region: { select: { name: true, isActive: true } },
      },
    });
    const myMembers = await this.prisma.orgMember.findMany({
      where: { memberId: ownerId },
      include: {
        org: {
          include: {
            industry: { select: { name: true, isActive: true } },
            region: { select: { name: true, isActive: true } },
          },
        },
      },
    });
    // Map myOrgs to add isOwner field with value true
    const myOrgsWithIsOwner = myOrgs.map((org) => ({
      ...org,
      isOwner: true,
    }));

    // Map myMembers to add isOwner field with value false
    const myMembersWithIsOwner = myMembers.map((member) => ({
      ...member.org,
      isOwner: false,
    }));

    // Merge the arrays
    const mergedOrgs = [...myOrgsWithIsOwner, ...myMembersWithIsOwner];

    // Return the merged array
    return mergedOrgs;
  }

  async deleteOrg(id: number, ownerId: number): Promise<Org> {
    const organization = await this.prisma.org.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    if (organization.ownerId !== ownerId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this organization',
      );
    }

    return this.prisma.org.delete({ where: { id } });
  }
  async updateOrg(
    orgId: number,
    ownerId: number,
    updateOrgDto: UpdateOrgDto,
    logoUrl?: string,
  ) {
    const organization = await this.prisma.org.findUnique({
      where: { id: orgId },
    });

    if (!organization || organization.ownerId !== ownerId) {
      throw new NotFoundException('Organization not found or unauthorized');
    }

    return this.prisma.org.update({
      where: { id: orgId },
      data: {
        ...updateOrgDto,
        logo: logoUrl || organization.logo,
      },
    });
  }
  async searchOrg(name: string) {
    return this.prisma.org.findMany({
      where: {
        OR: [
          { name: { contains: name, mode: 'insensitive' } },
          { region: { name: { contains: name, mode: 'insensitive' } } },
          { industry: { name: { contains: name, mode: 'insensitive' } } },
        ],
      },
    });
  }
  async requestOwnershipTransfer(
    requestedBy: number,
    createOwnershipTransfer: CreateOrgOwnershipTransfer,
  ) {
    return this.prisma.ownershipTransfer.create({
      data: {
        requestedBy,
        ...createOwnershipTransfer,
      },
    });
  }
  async approveOrRejectOwnershipRequest(
    currentUserId: number,
    requestId: number,
    type: UpdateOrgOwnershipTransferStatus['type'],
  ) {
    const transfer = await this.prisma.ownershipTransfer.findUnique({
      where: { id: requestId },
      include: { org: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    if (transfer.org.ownerId !== currentUserId) {
      throw new ForbiddenException(
        'Only the current owner can approve the transfer',
      );
    }

    if (transfer.status !== 'Pending') {
      throw new BadRequestException('Transfer request is not pending');
    }
    if (type === 'Rejected') {
      return this.prisma.ownershipTransfer.update({
        where: { id: requestId },
        data: { status: 'Rejected' },
      });
    }
    // Update Org  OwnerId
    const updatedOrg = await this.prisma.org.update({
      where: { id: transfer.orgId },
      data: { ownerId: transfer.newOwnerId },
    });
    await this.prisma.ownershipTransfer.update({
      where: { id: requestId },
      data: { status: 'Approved' },
    });
    return updatedOrg;
  }
}
