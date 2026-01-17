import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TransportModule } from '../transport/transport.module';

@Module({
  imports: [PrismaModule, AuthModule, TransportModule],
  controllers: [DriverController],
})
export class DriverModule {}
