import { ApiProperty } from '@nestjs/swagger';

export class VehicleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  vehicleNumber: string;

  @ApiProperty({ nullable: true })
  type: string | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
