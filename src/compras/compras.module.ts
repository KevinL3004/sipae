import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service.js';
import { ComprasController } from './compras.controller.js';
import { AsignacionPresupuesto } from './asignacion-presupuesto.entity.js';
import { Proveedor } from './proveedor.entity.js';
import { PlanCompra } from './plan-compra.entity.js';
import { ItemPlanCompra } from './item-plan-compra.entity.js';
import { CompraRealizada } from './compra-realizada.entity.js';
import { ItemCompra } from './item-compra.entity.js';
import { TecnicoMineduc } from '../escuelas/tecnico-mineduc.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AsignacionPresupuesto, Proveedor,
      PlanCompra, ItemPlanCompra,
      CompraRealizada, ItemCompra,
      TecnicoMineduc,
    ]),
  ],
  providers: [ComprasService],
  controllers: [ComprasController],
  exports: [ComprasService],
})
export class ComprasModule { }