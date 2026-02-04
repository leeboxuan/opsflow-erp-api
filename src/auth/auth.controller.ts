import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './guards/auth.guard';
import { TenantGuard } from './guards/tenant.guard';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipStatus } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    // Use public anon key for user authentication (not service role)
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_PROJECT_URL') ||
      this.configService.get<string>('SUPABASE_URL') ||
      '';
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new UnauthorizedException('Supabase configuration is missing. SUPABASE_ANON_KEY is required for login.');
    }

    // Create a public client for user authentication
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = data.session.access_token;

    // Use AuthService to map Supabase auth user (sub) to public.users via authUserId
    const authUser = await this.authService.verifyToken(accessToken);

    if (!authUser) {
      throw new UnauthorizedException('Unable to map authenticated user');
    }

    // Get the user's first active tenant membership (if any)
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        userId: authUser.userId,
        status: MembershipStatus.Active,
      },
      include: {
        tenant: true,
      },
    });

    return {
      accessToken,
      user: {
        id: authUser.userId,
        email: authUser.email,
        role: membership?.role || null,
        tenantId: membership?.tenantId || undefined,
      },
    };
  }

  @Get('me')
  @UseGuards(AuthGuard, TenantGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user and tenant information' })
  async getMe(@Request() req: any) {
    const authUserId: string | undefined = req.user.authUserId;

    if (!authUserId) {
      throw new UnauthorizedException('Missing auth user id');
    }

    // Look up app user by authUserId (Supabase sub), backfilling defaults if needed
    let user = await this.prisma.user.findFirst({
      where: { authUserId } as any,
    });

    if (!user) {
      // As a fallback, try by email from request
      const email = req.user.email;
      if (!email) {
        throw new UnauthorizedException('User not found');
      }
      user = await this.prisma.user.findFirst({
        where: { email },
      });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updates: any = {};
    if (!(user as any).authUserId) {
      updates.authUserId = authUserId;
    }
    if (!(user as any).role) {
      updates.role = 'USER';
    }
    if (Object.keys(updates).length > 0) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: updates as any,
      });
    }

    const effectiveRole = (user as any).role || 'USER';

    // Get all memberships for the user
    const memberships = await this.prisma.tenantMembership.findMany({
      where: {
        userId: user.id,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const tenantMemberships = memberships.map((membership) => ({
      tenantId: membership.tenantId,
      role: membership.role,
      status: membership.status,
      tenant: {
        id: membership.tenant.id,
        name: membership.tenant.name,
      },
    }));

    return {
      id: user.id,
      email: user.email,
      role: effectiveRole,                // global app role, never null
      authUserId: (user as any).authUserId, // Supabase auth user id
      tenantMemberships,
    };
  }
}
