import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  passwordActual: string;

  @IsString()
  @MinLength(8)
  passwordNuevo: string;
}