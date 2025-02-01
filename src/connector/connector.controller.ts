import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/connector.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Connector')
@ApiBearerAuth()
@Controller('connector')
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request Org Connecter' })
  @UseGuards(AuthGuard)
  create(@Req() req: any, @Body() createConnectorDto: CreateConnectorDto) {
    const userId: number = req.user.id;
    return this.connectorService.create(createConnectorDto, userId);
  }

  @Get('my-requests')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get My Org Connecter Request' })
  findAll(@Req() req: any) {
    const userId: number = req.user.id;
    return this.connectorService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Org Connecter Request By Id' })
  findOne(@Param('id') id: string) {
    return this.connectorService.findOne(+id);
  }

  @Get(':orgId')
  @ApiOperation({ summary: 'Get Org Connecter Request By OrgId' })
  findByOrgId(@Param('orgId') orgId: string) {
    return this.connectorService.findByOrgId(+orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update My Org Connecter Request' })
  @UseGuards(AuthGuard)
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateConnectorDto: UpdateConnectorDto,
  ) {
    const connecterId: number = req.user.id;
    const connectorRequest = await this.connectorService.findOne(+id);
    if (!connectorRequest) {
      throw new NotFoundException('Request not found');
    }
    if (connectorRequest.org.ownerId !== connecterId) {
      throw new NotFoundException(
        'You are not authorized to approve or reject this request',
      );
    }
    return this.connectorService.update(
      +id,
      updateConnectorDto,
      connecterId,
      connectorRequest.orgId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove Org Connecter Request' })
  @UseGuards(AuthGuard)
  async remove(@Req() req: any, @Param('id') id: string) {
    const connecterId: number = req.user.id;
    const connectorRequest = await this.connectorService.findOne(+id);
    if (!connectorRequest) {
      throw new NotFoundException('Request not found');
    }
    if (connectorRequest.connecterId !== connecterId) {
      throw new NotFoundException(
        'You are not authorized to delete this request',
      );
    }

    return this.connectorService.remove(+id);
  }
}
