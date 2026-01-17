"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const event_log_service_1 = require("./event-log.service");
let TripService = class TripService {
    constructor(prisma, eventLogService) {
        this.prisma = prisma;
        this.eventLogService = eventLogService;
    }
    async createTrip(tenantId, dto) {
        const normalizedStops = dto.stops
            .map((stop, index) => ({
            ...stop,
            sequence: stop.sequence || index + 1,
        }))
            .sort((a, b) => a.sequence - b.sequence);
        const sequences = normalizedStops.map((s) => s.sequence);
        if (sequences[0] !== 1) {
            throw new common_1.BadRequestException('Stop sequence must start from 1');
        }
        if (new Set(sequences).size !== sequences.length) {
            throw new common_1.BadRequestException('Stop sequences must be unique');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const trip = await tx.trip.create({
                data: {
                    tenantId,
                    status: client_1.TripStatus.Draft,
                    plannedStartAt: dto.plannedStartAt
                        ? new Date(dto.plannedStartAt)
                        : null,
                    plannedEndAt: dto.plannedEndAt ? new Date(dto.plannedEndAt) : null,
                },
            });
            const stops = await Promise.all(normalizedStops.map((stopDto) => tx.stop.create({
                data: {
                    tenantId,
                    tripId: trip.id,
                    sequence: stopDto.sequence,
                    type: stopDto.type,
                    addressLine1: stopDto.addressLine1,
                    addressLine2: stopDto.addressLine2 || null,
                    city: stopDto.city,
                    postalCode: stopDto.postalCode,
                    country: stopDto.country,
                    plannedAt: stopDto.plannedAt ? new Date(stopDto.plannedAt) : null,
                    transportOrderId: stopDto.transportOrderId || null,
                },
            })));
            return { trip, stops };
        });
        await this.eventLogService.logEvent(tenantId, 'Trip', result.trip.id, 'TRIP_CREATED', {
            plannedStartAt: result.trip.plannedStartAt,
            plannedEndAt: result.trip.plannedEndAt,
        });
        for (const stop of result.stops) {
            await this.eventLogService.logEvent(tenantId, 'Stop', stop.id, 'STOP_CREATED', {
                sequence: stop.sequence,
                type: stop.type,
                tripId: result.trip.id,
            });
        }
        return this.toDto(result.trip, result.stops);
    }
    async listTrips(tenantId, cursor, limit = 20) {
        const take = Math.min(limit, 100);
        const where = {
            tenantId,
            ...(cursor && {
                id: {
                    gt: cursor,
                },
            }),
        };
        const trips = await this.prisma.trip.findMany({
            where,
            take: take + 1,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                stops: {
                    orderBy: {
                        sequence: 'asc',
                    },
                    include: {
                        pods: {
                            take: 1,
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                    },
                },
            },
        });
        const hasMore = trips.length > take;
        const result = hasMore ? trips.slice(0, take) : trips;
        const nextCursor = hasMore ? result[result.length - 1].id : undefined;
        return {
            trips: result.map((trip) => this.toDto(trip, trip.stops.map((stop) => ({
                ...stop,
                pod: stop.pods[0] || null,
            })))),
            nextCursor,
        };
    }
    async getTripById(tenantId, id) {
        const trip = await this.prisma.trip.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                stops: {
                    orderBy: {
                        sequence: 'asc',
                    },
                    include: {
                        pods: {
                            take: 1,
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                    },
                },
            },
        });
        if (!trip) {
            return null;
        }
        return this.toDto(trip, trip.stops.map((stop) => ({
            ...stop,
            pod: stop.pods[0] || null,
        })));
    }
    toDto(trip, stops) {
        return {
            id: trip.id,
            status: trip.status,
            plannedStartAt: trip.plannedStartAt,
            plannedEndAt: trip.plannedEndAt,
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt,
            stops: stops.map((stop) => this.stopToDto(stop)),
        };
    }
    stopToDto(stop) {
        return {
            id: stop.id,
            sequence: stop.sequence,
            type: stop.type,
            addressLine1: stop.addressLine1,
            addressLine2: stop.addressLine2,
            city: stop.city,
            postalCode: stop.postalCode,
            country: stop.country,
            plannedAt: stop.plannedAt,
            transportOrderId: stop.transportOrderId,
            createdAt: stop.createdAt,
            updatedAt: stop.updatedAt,
            pod: stop.pod ? this.podToDto(stop.pod) : null,
        };
    }
    podToDto(pod) {
        return {
            id: pod.id,
            status: pod.status,
            signedBy: pod.signedBy,
            signedAt: pod.signedAt,
            photoUrl: pod.photoUrl,
            createdAt: pod.createdAt,
            updatedAt: pod.updatedAt,
        };
    }
};
exports.TripService = TripService;
exports.TripService = TripService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_log_service_1.EventLogService])
], TripService);
//# sourceMappingURL=trip.service.js.map