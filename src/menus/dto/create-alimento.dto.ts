import {
  IsString, IsNumber, IsEnum, IsOptional, Min, IsDateString, IsInt
} from 'class-validator';
import { GrupoAlimentario, OrigenAlimento, TipoCompraAlimento } from '../alimento.entity.js';

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

  @IsString() @IsOptional() precioRefFuente?: string;
  @IsDateString() @IsOptional() precioRefFecha?: string;
  @IsString() @IsOptional() precioRefZona?: string;
  @IsEnum(TipoCompraAlimento) @IsOptional() tipoCompra?: TipoCompraAlimento;
  @IsEnum(OrigenAlimento) @IsOptional() origenCompra?: OrigenAlimento;
  @IsInt() @Min(1) @IsOptional() diasVidaUtil?: number;

  @IsString() @IsOptional() unidadInventario?: string;
  @IsString() @IsOptional() fuenteNutricional?: string;
}