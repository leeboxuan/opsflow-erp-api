import { Role } from '@prisma/client';
export declare class LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    user: {
        id: string;
        email: string;
        role: Role | null;
        tenantId?: string;
    };
}
