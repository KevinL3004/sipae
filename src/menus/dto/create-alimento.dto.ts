import {
  IsString, IsNumber, IsEnum, IsOptional, Min
} from 'class-validator';
import { GrupoAlimentario } from '../alimento.entity.js';

export class CreateAlimentoDto {
  @IsString()
  nombre: string;

  @IsEnum(GrupoAlimentario)
  grupo: GrupoAlimentario;

  @IsNumber()
  @Min(0)
  kcalPor100g: number;

  @IsNumber() @Min(0) @IsOptional() proteinaG?: number;
  @IsNumber() @Min(0) @IsOptional() carbohidratosG?: number;
  @IsNumber() @Min(0) @IsOptional() grasasG?: number;
  @IsNumber() @IsOptional() precioRefQ?: number;

  @IsString() @IsOptional() unidadInventario?: string;
  @IsString() @IsOptional() fuenteNutricional?: string;
}