import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipStatus, Role } from '@prisma/client';

export interface TenantDto {
  id: string;
  name: string;
  slug: string;
  role: Role;
  createdAt: Date;
}

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getTenants(@Request() req: any): Promise<TenantDto[]> {
    const user = req.user;

    // Use userId from req.user (set by AuthGuard)
    if (!user || !user.userId) {
      return [];
    }

    // Get all tenants where user has active membership
    const memberships = await this.prisma.tenantMembership.findMany({
      where: {
        userId: user.userId,
        status: MembershipStatus.Active,
      },
      include: {
        tenant: true,
      },
      orderBy: {
        tenant: {
          name: 'asc',
        },
      },
    });

    // Map Prisma results to DTO shape
    return memberships.map(
      (membership): TenantDto => ({
        id: membership.tenant.id,
        name: membership.tenant.name,
        slug: membership.tenant.slug,
        role: membership.role,
        createdAt: membership.tenant.createdAt,
      }),
    );
  }
}
