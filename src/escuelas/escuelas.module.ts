import { Module } from '@nestjs/common';
import { EscuelasController } from './escuelas.controller.js';
import { EscuelasService } from './escuelas.service.js';

@Module({
  controllers: [EscuelasController],
  providers: [EscuelasService]
})
export class EscuelasModule {}
