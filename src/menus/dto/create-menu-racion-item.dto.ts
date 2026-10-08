import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrigenRacion {
  AGRICULTURA_FAMILIAR = 'agricultura_familiar',
  PROCESADO = 'procesado',
  POR_DEFINIR = 'por_definir',
}

export class CreateMenuRacionItemDto {
  @IsString()
  opcionCodigo: string;

  @IsString()
  grupoBeneficiario: string;

  @IsString()
  alimentoNombre: string;

  @IsString()
  presentacion: string;

  @IsNumber()
  @Min(0.001)
  cantidad: number;

  @IsString()
  unidad: string;

  @IsEnum(OrigenRacion)
  @IsOptional()
  origenCompra?: OrigenRacion;

  @IsString()
  @IsOptional()
  grupoNutriente?: string;

  @IsUUID()
  @IsOptional()
  alimentoId?: string;
}

export class ReplaceMenuRacionItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuRacionItemDto)
  items: CreateMenuRacionItemDto[];
}