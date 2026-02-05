import { StopType } from '@prisma/client';
export declare class CreateStopDto {
    sequence: number;
    type: StopType;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    plannedAt?: string;
    transportOrderId?: string;
}
export declare class CreateTripDto {
    plannedStartAt?: string;
    plannedEndAt?: string;
    stops: CreateStopDto[];
}
