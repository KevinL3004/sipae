import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidacionesService } from './liquidaciones.service.js';
import { LiquidacionesController } from './liquidaciones.controller.js';
import { Liquidacion } from './liquidacion.entity.js';
import { AsignacionPresupuesto } from '../compras/asignacion-presupuesto.entity.js';
import { CompraRealizada } from '../compras/compra-realizada.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Liquidacion,
      AsignacionPresupuesto,
      CompraRealizada,
    ]),
  ],
  providers: [LiquidacionesService],
  controllers: [LiquidacionesController],
  exports: [LiquidacionesService],
})
export class LiquidacionesModule { }