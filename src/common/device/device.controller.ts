import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Device')
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
}
