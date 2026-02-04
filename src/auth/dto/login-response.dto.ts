import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ description: 'Supabase session refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Session expiry (Unix timestamp in seconds)' })
  expiresAt: number;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    role: Role | null;
    tenantId?: string;
  };
}
