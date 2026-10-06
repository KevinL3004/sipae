import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { RolUsuario } from '../usuario.entity.js';

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  nombreCompleto: string;

  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}