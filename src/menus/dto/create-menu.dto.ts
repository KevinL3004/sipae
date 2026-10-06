import {
  IsString, IsDateString, IsOptional,
  IsArray, ValidateNested, IsEnum,
  IsNumber, IsUUID, Min, Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiaSemana } from '../dia-menu.entity.js';

export class CreateIngredienteDto {
  @IsUUID()
  alimentoId: string;

  @IsNumber()
  @Min(0.1)
  cantidadPorEstudianteG: number;

  @IsString() @IsOptional() unidad?: string;
}

export class CreateDiaMenuDto {
  @IsNumber() @Min(1) @Max(5)
  semanaNumero: number;

  @IsEnum(DiaSemana)
  dia: DiaSemana;

  @IsString()
  descripcionRefaccion: string;

  @IsNumber() @IsOptional() kcalEstimadas?: number;
  @IsString() @IsOptional() observaciones?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIngredienteDto)
  @IsOptional()
  ingredientes?: CreateIngredienteDto[];
}

export class CreateMenuDto {
  @IsString()
  nombre: string;

  @IsString() @IsOptional() descripcion?: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDiaMenuDto)
  @IsOptional()
  dias?: CreateDiaMenuDto[];
}