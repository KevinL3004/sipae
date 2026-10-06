import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { RolUsuario } from '../usuario.entity.js';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}