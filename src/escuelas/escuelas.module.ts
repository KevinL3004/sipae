import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscuelasService } from './escuelas.service.js';
import { EscuelasController } from './escuelas.controller.js';
import { Escuela } from './escuela.entity.js';
import { TecnicoMineduc } from './tecnico-mineduc.entity.js';
import { UsuarioEscuela } from './usuario-escuela.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Escuela, TecnicoMineduc, UsuarioEscuela])],
  providers: [EscuelasService],
  controllers: [EscuelasController],
  exports: [EscuelasService],
})
export class EscuelasModule { }