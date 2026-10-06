import { IsString, IsInt, IsOptional, IsBoolean, IsUUID, Min } from 'class-validator';

export class UpdateEscuelaDto {
  @IsString() @IsOptional() nombre?: string;
  @IsString() @IsOptional() municipio?: string;
  @IsString() @IsOptional() departamento?: string;
  @IsString() @IsOptional() direccion?: string;
  @IsInt() @Min(0) @IsOptional() matriculaActual?: number;
  @IsBoolean() @IsOptional() activa?: boolean;
  @IsUUID() @IsOptional() tecnicoId?: string;
}