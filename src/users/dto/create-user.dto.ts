import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';

export enum Role {
  USER = 'USER',
  STORE_MANAGER = 'STORE_MANAGER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.USER;
}
