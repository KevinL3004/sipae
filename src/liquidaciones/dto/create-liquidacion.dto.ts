import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateLiquidacionDto {
    @IsUUID()
    escuelaId: string;

    @IsUUID()
    asignacionId: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}