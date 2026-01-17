import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignVehicleDto {
  @ApiProperty({ example: 'clx1234567890abcdef', required: false })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ example: 'ABC-1234', required: false })
  @IsOptional()
  @IsString()
  vehicleNumber?: string;
}
