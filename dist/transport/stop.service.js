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
exports.StopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_log_service_1 = require("./event-log.service");
let StopService = class StopService {
    constructor(prisma, eventLogService) {
        this.prisma = prisma;
        this.eventLogService = eventLogService;
    }
    async updateStop(tenantId, stopId, dto) {
        const stop = await this.prisma.stop.findFirst({
            where: {
                id: stopId,
                tenantId,
            },
        });
        if (!stop) {
            throw new common_1.NotFoundException('Stop not found');
        }
        const updateData = {};
        if (dto.addressLine1 !== undefined) {
            updateData.addressLine1 = dto.addressLine1;
        }
        if (dto.addressLine2 !== undefined) {
            updateData.addressLine2 = dto.addressLine2 || null;
        }
        if (dto.city !== undefined) {
            updateData.city = dto.city;
        }
        if (dto.postalCode !== undefined) {
            updateData.postalCode = dto.postalCode;
        }
        if (dto.country !== undefined) {
            updateData.country = dto.country;
        }
        if (dto.plannedAt !== undefined) {
            updateData.plannedAt = dto.plannedAt ? new Date(dto.plannedAt) : null;
        }
        const updatedStop = await this.prisma.stop.update({
            where: {
                id: stopId,
            },
            data: updateData,
            include: {
                pods: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        await this.eventLogService.logEvent(tenantId, 'Stop', stopId, 'STOP_UPDATED', dto);
        return this.toDto(updatedStop);
    }
    toDto(stop) {
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
            pod: stop.pods && stop.pods[0]
                ? {
                    id: stop.pods[0].id,
                    status: stop.pods[0].status,
                    signedBy: stop.pods[0].signedBy,
                    signedAt: stop.pods[0].signedAt,
                    photoUrl: stop.pods[0].photoUrl,
                    createdAt: stop.pods[0].createdAt,
                    updatedAt: stop.pods[0].updatedAt,
                }
                : null,
        };
    }
};
exports.StopService = StopService;
exports.StopService = StopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_log_service_1.EventLogService])
], StopService);
//# sourceMappingURL=stop.service.js.map