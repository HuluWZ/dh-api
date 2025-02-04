import { Injectable } from '@nestjs/common';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/connector.dto';
import { PrismaService } from 'src/prisma';

@Injectable()
export class ConnectorService {
  constructor(private readonly prismaService: PrismaService) {}

  isPendingRequestExist(orgId: number, connecterId: number) {
    return this.prismaService.orgConnecterRequest.findFirst({
      where: { orgId, connecterId, status: 'Pending' },
    });
  }

  isAlreadyOrgMembers(orgId: number, connecterId: number) {
    return this.prismaService.orgGroup.findFirst({
      where: { orgId, OrgGroupMember: { every: { memberId: connecterId } } },
    });
  }

  create(createConnectorDto: CreateConnectorDto, connecterId: number) {
    return this.prismaService.orgConnecterRequest.create({
      data: {
        orgId: createConnectorDto.orgId,
        connecterId,
      },
    });
  }

  findAll() {
    return this.prismaService.orgConnecterRequest.findMany({
      include: {
        org: true,
        connecter: true,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.orgConnecterRequest.findUnique({
      where: { id },
      include: { connecter: true, org: true },
    });
  }

  findByOrgId(orgId: number) {
    return this.prismaService.orgConnecterRequest.findMany({
      where: { orgId },
      include: { connecter: true, org: true },
    });
  }
  findByUserId(connecterId: number) {
    return this.prismaService.orgConnecterRequest.findMany({
      where: { connecterId },
      include: { connecter: true, org: true },
    });
  }

  async update(
    id: number,
    updateConnectorDto: UpdateConnectorDto,
    connecterId: number,
    orgId: number,
    ownerId: number,
    name: string,
  ) {
    if (updateConnectorDto.status == 'Approved') {
      const [_, orgGroup] = await this.prismaService.$transaction([
        this.prismaService.orgConnecter.create({
          data: { connecterId, orgId },
        }),
        this.prismaService.orgGroup.create({
          data: { name, orgId, isConnector: true },
        }),
      ]);
      if (orgGroup && orgGroup.id) {
        return this.prismaService.orgGroupMember.createMany({
          data: [
            { groupId: orgGroup.id, memberId: ownerId },
            { groupId: orgGroup.id, memberId: connecterId },
          ],
        });
      }
    }

    return this.prismaService.orgConnecterRequest.update({
      where: { id },
      data: { status: updateConnectorDto.status },
    });
  }

  remove(id: number) {
    return this.prismaService.orgConnecterRequest.delete({ where: { id } });
  }
}
