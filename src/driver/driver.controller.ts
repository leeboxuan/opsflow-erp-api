import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/guards/role.guard';
import { TripService } from '../transport/trip.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { AssignVehicleDto } from './dto/assign-vehicle.dto';
import { TripDto } from '../transport/dto/trip.dto';

@ApiTags('driver')
@Controller('driver')
@UseGuards(AuthGuard, TenantGuard, RoleGuard)
@Roles(Role.Driver)
@ApiBearerAuth('JWT-auth')
export class DriverController {
  constructor(
    private readonly tripService: TripService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('trips')
  @ApiOperation({ summary: 'Get trips assigned to current driver' })
  async getMyTrips(@Request() req: any): Promise<{
    trips: TripDto[];
    nextCursor?: string;
  }> {
    const tenantId = req.tenant.tenantId;
    const userId = req.user.userId;

    // Get trips assigned to this driver
    const trips = await this.tripService.listTripsForDriver(
      tenantId,
      userId,
      undefined,
      20,
    );

    return trips;
  }

  @Post('trips/:tripId/select-vehicle')
  @ApiOperation({
    summary: 'Select vehicle for a trip (Driver only)',
  })
  async selectVehicle(
    @Request() req: any,
    @Param('tripId') tripId: string,
    @Body() dto: AssignVehicleDto,
  ): Promise<TripDto> {
    const tenantId = req.tenant.tenantId;
    const userId = req.user.userId;

    // Verify trip is assigned to this driver
    const trip = await this.prisma.trip.findFirst({
      where: {
        id: tripId,
        tenantId,
        assignedDriverId: userId,
      },
    });

    if (!trip) {
      throw new NotFoundException(
        'Trip not found or not assigned to you',
      );
    }

    return this.tripService.assignVehicle(tenantId, tripId, dto);
  }
}
