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
exports.TenantGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TenantGuard = class TenantGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const tenantIdHeader = request.headers['x-tenant-id'];
        const user = request.user;
        if (!user || !user.userId) {
            throw new common_1.ForbiddenException('User must be authenticated first');
        }
        if (user.isSuperadmin) {
            if (!tenantIdHeader) {
                request.tenant = {
                    tenantId: null,
                    role: client_1.Role.Admin,
                    isSuperadmin: true,
                };
                return true;
            }
            const tenant = await this.prisma.tenant.findFirst({
                where: { id: tenantIdHeader },
            });
            if (!tenant) {
                throw new common_1.BadRequestException('Tenant not found');
            }
            const membership = await this.prisma.tenantMembership.findFirst({
                where: {
                    tenantId: tenantIdHeader,
                    userId: user.userId,
                    status: client_1.MembershipStatus.Active,
                },
            });
            request.tenant = {
                tenantId: tenantIdHeader,
                role: membership?.role ?? client_1.Role.Admin,
                isSuperadmin: true,
            };
            return true;
        }
        if (!tenantIdHeader) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        const membership = await this.prisma.tenantMembership.findFirst({
            where: {
                tenantId: tenantIdHeader,
                userId: user.userId,
                status: client_1.MembershipStatus.Active,
            },
            include: {
                tenant: true,
            },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('User is not a member of this tenant or membership is not Active');
        }
        request.tenant = {
            tenantId: tenantIdHeader,
            role: membership.role,
            isSuperadmin: false,
        };
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantGuard);
//# sourceMappingURL=tenant.guard.js.map