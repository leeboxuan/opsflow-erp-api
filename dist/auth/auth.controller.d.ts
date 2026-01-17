import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getMe(req: any): Promise<{
        user: any;
        tenant: any;
    }>;
}
