import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './inventario.service.js';
import { InventarioController } from './inventario.controller.js';
import { Inventario } from './inventario.entity.js';
import { MovimientoInventario } from './movimiento-inventario.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Inventario, MovimientoInventario])],
  providers: [InventarioService],
  controllers: [InventarioController],
  exports: [InventarioService],
})
export class InventarioModule {}