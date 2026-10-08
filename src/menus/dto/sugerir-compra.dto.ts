import { IsInt, IsString, Min } from 'class-validator';

export class SugerirCompraDto {
  @IsString()
  opcionCodigo: string;

  @IsString()
  grupoBeneficiario: string;

  @IsInt()
  @Min(1)
  estudiantes: number;
}