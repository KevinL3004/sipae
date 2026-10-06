import { IsUUID, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';

export class CreateAsignacionDto {
    @IsUUID()
    escuelaId: string;

    @IsUUID()
    menuId: string;

    @IsNumber()
    @Min(1)
    montoTotalQ: number;

    @IsDateString()
    periodoInicio: string;

    @IsDateString()
    periodoFin: string;

    @IsString()
    @IsOptional()
    notas?: string;
}