import {
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';

export class UpdateStopDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'addressLine1 cannot be empty' })
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'city cannot be empty' })
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'postalCode cannot be empty' })
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'country cannot be empty' })
  country?: string;

  @IsOptional()
  @IsDateString()
  plannedAt?: string;
}
