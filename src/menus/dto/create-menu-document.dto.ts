import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuDocumentDto {
  @IsString()
  nombre: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  nivelEducativo?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  grupoBeneficiario?: string;

  @IsString()
  @IsOptional()
  numeroEntrega?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  diasCobertura?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  montoDiarioAlumnoQ?: number;
}

export class DistributeMenuDto {
  @IsArray()
  @IsUUID('4', { each: true })
  escuelaIds: string[];
}