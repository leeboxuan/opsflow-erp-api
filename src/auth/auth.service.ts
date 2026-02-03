import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { jwtVerify, createRemoteJWKSet, decodeProtectedHeader } from 'jose';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  alg?: string;
  iss?: string;
  aud?: string | string[];
  [key: string]: any;
}

export interface AuthUser {
  userId: string;
  email: string;
  /** True when JWT app_metadata.global_role === 'SUPERADMIN' (set in cargo-erp/Supabase). */
  isSuperadmin?: boolean;
}

@Injectable()
export class AuthService {
  private jwksUrl: string;
  private issuer: string;
  private jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Get project URL or ref
    const projectUrl =
      this.configService.get<string>('SUPABASE_PROJECT_URL') ||
      this.configService.get<string>('SUPABASE_URL');
    const projectRef = this.configService.get<string>('SUPABASE_PROJECT_REF');

    if (projectRef) {
      // Use project ref to build URLs
      this.issuer = `https://${projectRef}.supabase.co/auth/v1`;
      this.jwksUrl = `${this.issuer}/.well-known/jwks.json`;
    } else if (projectUrl) {
      // Extract project ref from URL if full URL provided
      const urlMatch = projectUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
      if (urlMatch) {
        const ref = urlMatch[1];
        this.issuer = `https://${ref}.supabase.co/auth/v1`;
        this.jwksUrl = `${this.issuer}/.well-known/jwks.json`;
      } else {
        throw new Error(
          'Invalid SUPABASE_PROJECT_URL format. Expected: https://<ref>.supabase.co',
        );
      }
    } else {
      throw new Error(
        'SUPABASE_PROJECT_URL or SUPABASE_PROJECT_REF must be configured',
      );
    }

    // Create JWKS set
    this.jwks = createRemoteJWKSet(new URL(this.jwksUrl));
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    let header;
    try {
      header = decodeProtectedHeader(token);
    } catch {
      return null;
    }

    if (header.alg === 'HS256') {
      return this.verifyTokenLegacy(token);
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: 'authenticated',
      });

      if (!payload.email || !payload.sub) {
        return null;
      }

      const appMetadata = (payload as any).app_metadata as Record<string, unknown> | undefined;
      const isSuperadmin = appMetadata?.global_role === 'SUPERADMIN';

      // Find or create user in database
      const user = await this.prisma.user.upsert({
        where: { email: payload.email as string },
        update: {},
        create: {
          email: payload.email as string,
          name: null,
        },
      });

      return {
        userId: user.id,
        email: user.email,
        isSuperadmin: isSuperadmin ?? false,
      };
    } catch {
      return null;
    }
  }

  private async verifyTokenLegacy(token: string): Promise<AuthUser | null> {
    const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');

    if (!jwtSecret) {
      return null; // No fallback available
    }

    try {
      // Verify and decode JWT using symmetric key
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      if (!decoded.email || !decoded.sub) {
        return null;
      }

      const appMetadata = decoded.app_metadata as Record<string, unknown> | undefined;
      const isSuperadmin = appMetadata?.global_role === 'SUPERADMIN';

      // Find or create user in database
      const user = await this.prisma.user.upsert({
        where: { email: decoded.email },
        update: {},
        create: {
          email: decoded.email,
          name: null,
        },
      });

      return {
        userId: user.id,
        email: user.email,
        isSuperadmin: isSuperadmin ?? false,
      };
    } catch (error) {
      // JWT verification failed
      return null;
    }
  }
}
