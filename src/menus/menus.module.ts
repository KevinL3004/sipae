import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusService } from './menus.service.js';
import { MenusController } from './menus.controller.js';
import { MenuOficial } from './menu-oficial.entity.js';
import { Alimento } from './alimento.entity.js';
import { DiaMenu } from './dia-menu.entity.js';
import { IngredienteDia } from './ingrediente-dia.entity.js';
import { TecnicoMineduc } from '../escuelas/tecnico-mineduc.entity.js';
import { MenuDistribucion } from './menu-distribucion.entity.js';
import { MenuRacionItem } from './menu-racion-item.entity.js';
import { Escuela } from '../escuelas/escuela.entity.js';
import { Usuario } from '../users/usuario.entity.js';
import { UsuarioEscuela } from '../escuelas/usuario-escuela.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([MenuOficial, Alimento, DiaMenu, IngredienteDia, TecnicoMineduc, MenuDistribucion, MenuRacionItem, Escuela, Usuario, UsuarioEscuela])],
  providers: [MenusService],
  controllers: [MenusController],
  exports: [MenusService],
})
export class MenusModule {}