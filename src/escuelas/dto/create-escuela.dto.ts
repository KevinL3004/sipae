import { IsString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateEscuelaDto {
  @IsString()
  codigoMineduc: string;

  @IsString()
  nombre: string;

  @IsString()
  municipio: string;

  @IsString()
  departamento: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsInt()
  @Min(0)
  matriculaActual: number;

  @IsUUID()
  @IsOptional()
  tecnicoId?: string;
}