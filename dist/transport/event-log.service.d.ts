import { PrismaService } from '../prisma/prisma.service';
export declare class EventLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    logEvent(tenantId: string, entityType: 'Order' | 'Trip' | 'Stop', entityId: string, eventType: string, payload?: Record<string, any>): Promise<void>;
}
