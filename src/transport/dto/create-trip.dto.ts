import {
  IsArray,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StopType } from '@prisma/client';

export class CreateStopDto {
  @IsNumber()
  sequence: number;

  @IsEnum(StopType)
  type: StopType;

  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsDateString()
  plannedAt?: string;

  @IsOptional()
  @IsString()
  transportOrderId?: string;
}

export class CreateTripDto {
  @IsOptional()
  @IsDateString()
  plannedStartAt?: string;

  @IsOptional()
  @IsDateString()
  plannedEndAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStopDto)
  stops: CreateStopDto[];
}
