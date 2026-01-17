import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripDto } from './dto/trip.dto';
import { EventLogService } from './event-log.service';
export declare class TripService {
    private readonly prisma;
    private readonly eventLogService;
    constructor(prisma: PrismaService, eventLogService: EventLogService);
    createTrip(tenantId: string, dto: CreateTripDto): Promise<TripDto>;
    listTrips(tenantId: string, cursor?: string, limit?: number): Promise<{
        trips: TripDto[];
        nextCursor?: string;
    }>;
    getTripById(tenantId: string, id: string): Promise<TripDto | null>;
    private toDto;
    private stopToDto;
    private podToDto;
}
