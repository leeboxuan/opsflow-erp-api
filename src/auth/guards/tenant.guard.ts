import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }

    const user = request.user;
    if (!user || !user.userId) {
      throw new ForbiddenException('User must be authenticated first');
    }

    // Verify user membership in tenant using userId from req.user
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        tenantId,
        userId: user.userId,
        status: MembershipStatus.Active,
      },
      include: {
        tenant: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'User is not a member of this tenant or membership is not Active',
      );
    }

    // Attach { tenantId, role } to request.tenant
    request.tenant = {
      tenantId: tenantId,
      role: membership.role,
    };

    return true;
  }
}
