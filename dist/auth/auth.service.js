"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const jose_1 = require("jose");
const jwt = __importStar(require("jsonwebtoken"));
let AuthService = AuthService_1 = class AuthService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuthService_1.name);
        const projectUrl = this.configService.get('SUPABASE_PROJECT_URL') ||
            this.configService.get('SUPABASE_URL');
        const projectRef = this.configService.get('SUPABASE_PROJECT_REF');
        if (projectRef) {
            this.issuer = `https://${projectRef}.supabase.co/auth/v1`;
            this.jwksUrl = `${this.issuer}/.well-known/jwks.json`;
        }
        else if (projectUrl) {
            const urlMatch = projectUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
            if (urlMatch) {
                const ref = urlMatch[1];
                this.issuer = `https://${ref}.supabase.co/auth/v1`;
                this.jwksUrl = `${this.issuer}/.well-known/jwks.json`;
            }
            else {
                throw new Error('Invalid SUPABASE_PROJECT_URL format. Expected: https://<ref>.supabase.co');
            }
        }
        else {
            throw new Error('SUPABASE_PROJECT_URL or SUPABASE_PROJECT_REF must be configured');
        }
        this.jwks = (0, jose_1.createRemoteJWKSet)(new URL(this.jwksUrl));
    }
    async verifyToken(token) {
        let header;
        try {
            header = (0, jose_1.decodeProtectedHeader)(token);
        }
        catch {
            return null;
        }
        console.log('JWT alg:', header.alg);
        if (header.alg === 'HS256') {
            return this.verifyTokenLegacy(token);
        }
        try {
            const { payload } = await (0, jose_1.jwtVerify)(token, this.jwks, {
                issuer: this.issuer,
                audience: 'authenticated',
            });
            const authUserId = payload.sub;
            const email = payload.email;
            if (!authUserId) {
                this.logger.error('JWT sub (authUserId) missing – cannot map Supabase Auth user to internal user');
                return null;
            }
            if (!email) {
                this.logger.error('JWT email missing – cannot map or create internal user');
                return null;
            }
            let user = await this.prisma.user.findFirst({
                where: { authUserId },
            });
            if (!user) {
                user = await this.prisma.user.findFirst({
                    where: { email },
                });
            }
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        authUserId,
                        email,
                        name: email,
                        role: 'USER',
                    },
                });
            }
            else {
                const updates = {};
                if (!user.authUserId) {
                    updates.authUserId = authUserId;
                }
                if (!user.role) {
                    updates.role = 'USER';
                }
                if (Object.keys(updates).length > 0) {
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: updates,
                    });
                }
            }
            const role = user.role ?? 'USER';
            const isSuperadmin = role === 'SUPERADMIN';
            return {
                userId: user.id,
                authUserId,
                email: user.email,
                role,
                isSuperadmin,
            };
        }
        catch (err) {
            this.logger.warn('User mapping failed: token verification or DB lookup/create failed', err?.message ?? err);
            return null;
        }
    }
    async verifyTokenLegacy(token) {
        const jwtSecret = this.configService.get('SUPABASE_JWT_SECRET');
        if (!jwtSecret) {
            return null;
        }
        try {
            const decoded = jwt.verify(token, jwtSecret);
            const authUserId = decoded.sub;
            const email = decoded.email;
            if (!authUserId) {
                this.logger.error('JWT sub (authUserId) missing – cannot map Supabase Auth user to internal user');
                return null;
            }
            if (!email) {
                this.logger.error('JWT email missing – cannot map or create internal user');
                return null;
            }
            let user = await this.prisma.user.findFirst({
                where: { authUserId },
            });
            if (!user) {
                user = await this.prisma.user.findFirst({
                    where: { email },
                });
            }
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        authUserId,
                        email,
                        name: email,
                        role: 'USER',
                    },
                });
            }
            else {
                const updates = {};
                if (!user.authUserId) {
                    updates.authUserId = authUserId;
                }
                if (!user.role) {
                    updates.role = 'USER';
                }
                if (Object.keys(updates).length > 0) {
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: updates,
                    });
                }
            }
            const role = user.role ?? 'USER';
            const isSuperadmin = role === 'SUPERADMIN';
            return {
                userId: user.id,
                authUserId,
                email: user.email,
                role,
                isSuperadmin,
            };
        }
        catch (error) {
            this.logger.warn('User mapping failed (legacy HS256): verification or DB failed', error?.message ?? error);
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map