import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class DriverDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  membershipId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
