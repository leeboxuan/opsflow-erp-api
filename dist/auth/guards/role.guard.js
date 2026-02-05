"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleGuard = exports.Roles = void 0;
const common_1 = require("@nestjs/common");
const Roles = (...roles) => (0, common_1.SetMetadata)('roles', roles);
exports.Roles = Roles;
let RoleGuard = class RoleGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const requiredRoles = this.getRoles(context);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const tenant = request.tenant;
        if (!tenant || !tenant.role) {
            throw new common_1.ForbiddenException('Tenant context not found. TenantGuard must be applied first.');
        }
        const userRole = tenant.role;
        if (!requiredRoles.includes(userRole)) {
            throw new common_1.ForbiddenException(`Required role: ${requiredRoles.join(' or ')}`);
        }
        return true;
    }
    getRoles(context) {
        return Reflect.getMetadata('roles', context.getHandler()) || [];
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = __decorate([
    (0, common_1.Injectable)()
], RoleGuard);
//# sourceMappingURL=role.guard.js.map