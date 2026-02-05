"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
function validateAuthEnv() {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret || jwtSecret.trim() === '') {
        throw new Error('SUPABASE_JWT_SECRET missing – cannot verify Supabase access token. Set it in env (Supabase Project Settings → API → JWT Secret).');
    }
}
async function bootstrap() {
    validateAuthEnv();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const rawOrigins = process.env.WEB_APP_URLS || process.env.WEB_APP_URL || 'http://localhost:3000';
    const allowedOrigins = rawOrigins
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('OpsFlow ERP API')
        .setDescription('API documentation for OpsFlow ERP Transport Management System')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT ?? 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`API server running on http://localhost:${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map