import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
    authUserId: string;
    email: string;
    role: string;
    isSuperadmin: boolean;
}
export declare class AuthService {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    private jwksUrl;
    private issuer;
    private jwks;
    constructor(configService: ConfigService, prisma: PrismaService);
    verifyToken(token: string): Promise<AuthUser | null>;
    private verifyTokenLegacy;
}
