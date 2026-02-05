export declare class HealthController {
    health(): {
        status: string;
    };
    tenantHealth(req: any): {
        ok: boolean;
        tenantId: any;
        role: any;
    };
}
