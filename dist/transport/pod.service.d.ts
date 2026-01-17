import { PrismaService } from '../prisma/prisma.service';
import { CreatePodDto } from './dto/create-pod.dto';
import { PodDto } from './dto/trip.dto';
import { EventLogService } from './event-log.service';
export declare class PodService {
    private readonly prisma;
    private readonly eventLogService;
    constructor(prisma: PrismaService, eventLogService: EventLogService);
    createOrUpdatePod(tenantId: string, stopId: string, dto: CreatePodDto): Promise<PodDto>;
    private toDto;
}
