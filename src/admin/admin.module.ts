import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { DriverModule } from '../driver/driver.module';

@Module({
  imports: [PrismaModule, AuthModule, DriverModule],
  controllers: [AdminController],
})
export class AdminModule {}
