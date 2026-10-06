import { IsNumber, IsUUID, Min } from 'class-validator';

export class UpdateStockMinimoDto {
  @IsUUID()
  escuelaId: string;

  @IsUUID()
  alimentoId: string;

  @IsNumber()
  @Min(0)
  stockMinimo: number;
}