import { TransportService } from './transport.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { TripDto } from './dto/trip.dto';
export declare class TransportController {
    private readonly transportService;
    constructor(transportService: TransportService);
    createOrder(req: any, dto: CreateOrderDto): Promise<OrderDto>;
    listOrders(req: any, cursor?: string, limit?: string): Promise<{
        orders: OrderDto[];
        nextCursor?: string;
    }>;
    getOrder(req: any, id: string): Promise<OrderDto>;
    planTrip(req: any, orderId: string): Promise<TripDto>;
}
