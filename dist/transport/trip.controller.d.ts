import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripDto } from './dto/trip.dto';
export declare class TripController {
    private readonly tripService;
    constructor(tripService: TripService);
    createTrip(req: any, dto: CreateTripDto): Promise<TripDto>;
    listTrips(req: any, cursor?: string, limit?: string): Promise<{
        trips: TripDto[];
        nextCursor?: string;
    }>;
    getTrip(req: any, id: string): Promise<TripDto>;
}
