import { Module } from '@nestjs/common';
import { RegionService } from './region/region.service';
import { RegionController } from './region/region.controller';
import { IndustryService } from './industry/industry.service';
import { IndustryController } from './industry/industry.controller';

@Module({
  controllers: [RegionController, IndustryController],
  providers: [RegionService, IndustryService],
})
export class CommonModule {}
