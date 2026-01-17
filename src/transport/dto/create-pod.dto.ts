import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { PodStatus } from '@prisma/client';

export class CreatePodDto {
  @IsEnum(PodStatus)
  status: PodStatus;

  @IsOptional()
  @IsString()
  signedBy?: string;

  @IsOptional()
  @IsDateString()
  signedAt?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
