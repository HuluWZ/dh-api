import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';

@ApiTags('Device')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @ApiOperation({ summary: 'Create Device Data ' })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Devices' })
  findAll() {
    return this.deviceService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get Device By User Id' })
  findOne(@Param('userId') userId: string) {
    return this.deviceService.findByUserId(+userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update Device By User Id' })
  update(
    @Param('userId') userId: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.deviceService.update(+userId, updateDeviceDto.deviceId);
  }
  @Delete(':userId')
  @ApiOperation({ summary: 'Delete Device By User Id' })
  delete(@Param('userId') userId: string) {
    return this.deviceService.deleteDeviceByUserId(+userId);
  }
}
