import { Module } from '@nestjs/common';
import { LiquidacionesController } from './liquidaciones.controller.js';
import { LiquidacionesService } from './liquidaciones.service.js';

@Module({
  controllers: [LiquidacionesController],
  providers: [LiquidacionesService]
})
export class LiquidacionesModule {}
