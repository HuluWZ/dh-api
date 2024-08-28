import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IndustryService } from './industry.service';
import { CreateIndustryDto, UpdateIndustryDto } from './dto/industry.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Industry')
@Controller('industries')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Post()
  @ApiOperation({ summary: 'Create Industry ' })
  create(@Body() createIndustryDto: CreateIndustryDto) {
    return this.industryService.create(createIndustryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Active Industry ' })
  findAll() {
    return this.industryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Industry By Id' })
  findOne(@Param('id') id: string) {
    return this.industryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Industry By ID' })
  update(
    @Param('id') id: string,
    @Body() updateIndustryDto: UpdateIndustryDto,
  ) {
    return this.industryService.update(+id, updateIndustryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Industry By ID' })
  remove(@Param('id') id: string) {
    return this.industryService.remove(+id);
  }
}
