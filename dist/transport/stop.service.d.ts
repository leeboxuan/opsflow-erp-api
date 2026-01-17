import { PrismaService } from '../prisma/prisma.service';
import { UpdateStopDto } from './dto/update-stop.dto';
import { StopDto } from './dto/trip.dto';
import { EventLogService } from './event-log.service';
export declare class StopService {
    private readonly prisma;
    private readonly eventLogService;
    constructor(prisma: PrismaService, eventLogService: EventLogService);
    updateStop(tenantId: string, stopId: string, dto: UpdateStopDto): Promise<StopDto>;
    private toDto;
}
