import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export interface TenantDto {
    id: string;
    name: string;
    slug: string;
    role: Role;
    createdAt: Date;
}
export declare class TenantsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTenants(req: any): Promise<TenantDto[]>;
}
