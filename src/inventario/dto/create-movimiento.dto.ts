import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TipoMovimiento } from '../movimiento-inventario.entity.js';

export class CreateMovimientoDto {
    @IsUUID()
    escuelaId: string;

    @IsUUID()
    alimentoId: string;

    @IsEnum(TipoMovimiento)
    tipo: TipoMovimiento;

    @IsNumber()
    @Min(0.001)
    cantidad: number;

    @IsString() @IsOptional() motivo?: string;
    @IsString() @IsOptional() observaciones?: string;
}