import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  customerRef: string;

  @IsOptional()
  @IsDateString()
  pickupWindowStart?: string;

  @IsOptional()
  @IsDateString()
  pickupWindowEnd?: string;

  @IsOptional()
  @IsDateString()
  deliveryWindowStart?: string;

  @IsOptional()
  @IsDateString()
  deliveryWindowEnd?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
