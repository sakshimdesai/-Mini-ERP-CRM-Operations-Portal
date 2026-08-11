import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ChallansService } from './challans.service';

import { CreateChallanDto } from './dto/create-challan.dto';
import { UpdateChallanStatusDto } from './dto/update-challan-status.dto';

@Controller('challans')
export class ChallansController {
  constructor(
    private readonly challansService: ChallansService,
  ) {}

  @Post()
  create(@Body() dto: CreateChallanDto) {
    return this.challansService.create(dto);
  }

  @Get()
  findAll() {
    return this.challansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.challansService.findOne(Number(id));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateChallanStatusDto,
  ) {
    return this.challansService.updateStatus(
      Number(id),
      dto,
    );
  }
}