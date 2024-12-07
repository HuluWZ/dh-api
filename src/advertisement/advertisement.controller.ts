import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdvertisementService } from './advertisement.service';
import {
  CreateAdvertisementDto,
  UpdateAdvertisementDto,
} from './dto/advertisement.dto';

@ApiTags('Advertisements')
@ApiBearerAuth()
@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  @ApiOperation({ summary: 'Create Advertisements' })
  createAd(@Body() createAdvertisementDto: CreateAdvertisementDto) {
    return this.advertisementService.create(createAdvertisementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Advertisements' })
  findAllAd() {
    return this.advertisementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get  Advertisement By Id' })
  findOneAd(@Param('id', ParseIntPipe) id: number) {
    return this.advertisementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Advertisement By Id' })
  updateAd(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
  ) {
    return this.advertisementService.update(id, updateAdvertisementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Advertisement By Id' })
  removeAd(@Param('id', ParseIntPipe) id: number) {
    return this.advertisementService.remove(id);
  }
}
