import {
    IsUUID, IsDateString, IsNumber,
    IsArray, ValidateNested, IsOptional,
    IsString, Min, IsIn
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemPlanDto {
    @IsUUID()
    alimentoId: string;

    @IsNumber() @Min(0.001)
    cantidadAComprar: number;

    @IsString()
    unidad: string;

    @IsNumber() @IsOptional() precioUnitarioQ?: number;

    @IsIn(['no_perecedero', 'semanal', 'diaria', 'por_definir'])
    @IsOptional()
    frecuenciaCompra?: string;

    @IsDateString() @IsOptional() fechaCompraSugerida?: string;

    @IsString() @IsOptional() observacionSugerencia?: string;
}

export class CreatePlanDto {
    @IsUUID()
    escuelaId: string;

    @IsUUID()
    asignacionId: string;

    @IsDateString()
    semanaInicio: string;

    @IsDateString()
    semanaFin: string;

    @IsNumber() @Min(1)
    numEstudiantes: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateItemPlanDto)
    @IsOptional()
    items?: CreateItemPlanDto[];
}