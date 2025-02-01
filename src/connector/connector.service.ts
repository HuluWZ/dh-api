import { Injectable } from '@nestjs/common';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/connector.dto';
import { PrismaService } from 'src/prisma';

@Injectable()
export class ConnectorService {
  constructor(private readonly prismaService: PrismaService) {}

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

  update(
    id: number,
    updateConnectorDto: UpdateConnectorDto,
    connecterId?: number,
    orgId?: number,
  ) {
    if (updateConnectorDto.status == 'Approved') {
      this.prismaService.orgConnecter.create({
        data: { connecterId, orgId },
      });
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
