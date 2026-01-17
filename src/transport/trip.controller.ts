import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripDto } from './dto/trip.dto';

@Controller('transport/trips')
@UseGuards(AuthGuard, TenantGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  async createTrip(
    @Request() req: any,
    @Body() dto: CreateTripDto,
  ): Promise<TripDto> {
    const tenantId = req.tenant.tenantId;
    return this.tripService.createTrip(tenantId, dto);
  }

  @Get()
  async listTrips(
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<{ trips: TripDto[]; nextCursor?: string }> {
    const tenantId = req.tenant.tenantId;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.tripService.listTrips(tenantId, cursor, limitNum);
  }

  @Get(':id')
  async getTrip(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<TripDto> {
    const tenantId = req.tenant.tenantId;
    const trip = await this.tripService.getTripById(tenantId, id);

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }
}
