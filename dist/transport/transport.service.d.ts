import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { TripDto } from './dto/trip.dto';
import { EventLogService } from './event-log.service';
export declare class TransportService {
    private readonly prisma;
    private readonly eventLogService;
    constructor(prisma: PrismaService, eventLogService: EventLogService);
    createOrder(tenantId: string, dto: CreateOrderDto): Promise<OrderDto>;
    listOrders(tenantId: string, cursor?: string, limit?: number): Promise<{
        orders: OrderDto[];
        nextCursor?: string;
    }>;
    getOrderById(tenantId: string, id: string): Promise<OrderDto | null>;
    planTripFromOrder(tenantId: string, orderId: string): Promise<TripDto>;
    private toDto;
    private toDtoWithStops;
    private tripToDto;
}
