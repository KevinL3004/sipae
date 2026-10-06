import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProveedorDto {
    @IsUUID()
    escuelaId: string;

    @IsString()
    nombre: string;

    @IsString() @IsOptional() contacto?: string;
    @IsString() @IsOptional() telefono?: string;
    @IsString() @IsOptional() nit?: string;
    @IsString() @IsOptional() productosQueProvee?: string;
}