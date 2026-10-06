import {
    IsUUID, IsDateString, IsNumber,
    IsOptional, IsString, IsArray,
    ValidateNested, Min
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemCompraDto {
    @IsUUID()
    alimentoId: string;

    @IsNumber() @Min(0.001)
    cantidadComprada: number;

    @IsString()
    unidad: string;

    @IsNumber() @Min(0)
    precioUnitarioQ: number;
}

export class CreateCompraDto {
    @IsUUID()
    planId: string;

    @IsUUID()
    @IsOptional()
    proveedorId?: string;

    @IsDateString()
    fechaCompra: string;

    @IsNumber() @Min(0)
    totalGastadoQ: number;

    @IsString() @IsOptional() numeroFactura?: string;
    @IsString() @IsOptional() observaciones?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateItemCompraDto)
    items: CreateItemCompraDto[];
}