import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class RoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
    private getRoles;
}
