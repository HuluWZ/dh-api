import { Module } from '@nestjs/common';
import { RegionService } from './region/region.service';
import { RegionController } from './region/region.controller';
import { IndustryService } from './industry/industry.service';
import { IndustryController } from './industry/industry.controller';
import { DeviceController } from './device/device.controller';
import { DeviceService } from './device/device.service';

@Module({
  controllers: [RegionController, IndustryController, DeviceController],
  providers: [RegionService, IndustryService, DeviceService],
})
export class CommonModule {}
