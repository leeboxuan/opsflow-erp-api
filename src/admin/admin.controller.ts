import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/guards/role.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Role, MembershipStatus } from '@prisma/client';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { DriverDto } from './dto/driver.dto';
import { VehicleDto } from './dto/vehicle.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, TenantGuard, RoleGuard)
@Roles(Role.Admin, Role.Ops)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('drivers')
  @ApiOperation({ summary: 'List all drivers (Admin/Ops only)' })
  async getDrivers(@Request() req: any): Promise<DriverDto[]> {
    const tenantId = req.tenant.tenantId;

    const memberships = await this.prisma.tenantMembership.findMany({
      where: {
        tenantId,
        role: Role.Driver,
        status: MembershipStatus.Active,
      },
      include: {
        user: true,
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    return memberships.map(
      (membership): DriverDto => ({
        id: membership.user.id,
        email: membership.user.email,
        name: membership.user.name,
        phone: membership.user.phone,
        role: membership.role,
        membershipId: membership.id,
        createdAt: membership.user.createdAt,
        updatedAt: membership.user.updatedAt,
      }),
    );
  }

  @Post('drivers')
  @ApiOperation({ summary: 'Create a new driver (Admin/Ops only)' })
  async createDriver(
    @Request() req: any,
    @Body() dto: CreateDriverDto,
  ): Promise<DriverDto> {
    const tenantId = req.tenant.tenantId;

    // Find or create user
    const user = await this.prisma.user.upsert({
      where: { email: dto.email },
      update: {
        name: dto.name || undefined,
        phone: dto.phone || undefined,
      },
      create: {
        email: dto.email,
        name: dto.name || null,
        phone: dto.phone || null,
      },
    });

    // Check if membership already exists
    const existingMembership = await this.prisma.tenantMembership.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      // Update existing membership to Driver role if not already
      const membership =
        existingMembership.role === Role.Driver
          ? existingMembership
          : await this.prisma.tenantMembership.update({
              where: { id: existingMembership.id },
              data: { role: Role.Driver },
            });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: membership.role,
        membershipId: membership.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    // Create new membership with Driver role
    const membership = await this.prisma.tenantMembership.create({
      data: {
        tenantId,
        userId: user.id,
        role: Role.Driver,
        status: MembershipStatus.Active,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: membership.role,
      membershipId: membership.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'List all vehicles (Admin/Ops only)' })
  async getVehicles(@Request() req: any): Promise<VehicleDto[]> {
    const tenantId = req.tenant.tenantId;

    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId },
      orderBy: {
        vehicleNumber: 'asc',
      },
    });

    return vehicles.map(
      (vehicle): VehicleDto => ({
        id: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        notes: vehicle.notes,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      }),
    );
  }

  @Post('vehicles')
  @ApiOperation({ summary: 'Create a new vehicle (Admin/Ops only)' })
  async createVehicle(
    @Request() req: any,
    @Body() dto: CreateVehicleDto,
  ): Promise<VehicleDto> {
    const tenantId = req.tenant.tenantId;

    // Check if vehicle number already exists for this tenant
    const existing = await this.prisma.vehicle.findUnique({
      where: {
        tenantId_vehicleNumber: {
          tenantId,
          vehicleNumber: dto.vehicleNumber,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Vehicle with this number already exists for this tenant',
      );
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        tenantId,
        vehicleNumber: dto.vehicleNumber,
        type: dto.type || null,
        notes: dto.notes || null,
      },
    });

    return {
      id: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      notes: vehicle.notes,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }
}
