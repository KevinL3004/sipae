import {
  Controller, Get, Post, Patch,
  Param, Body, UseGuards, ParseUUIDPipe, Req
} from '@nestjs/common';
import { MenusService } from './menus.service.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { CreateAlimentoDto } from './dto/create-alimento.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  // ── Alimentos ─────────────────────────────────────────────
  // GET /api/v1/menus/alimentos
  @Get('alimentos')
  getAlimentos() {
    return this.menusService.getAlimentos();
  }

  // POST /api/v1/menus/alimentos
  @Post('alimentos')
  @Roles('tecnico_mineduc', 'director')
  crearAlimento(@Body() dto: CreateAlimentoDto) {
    return this.menusService.crearAlimento(dto);
  }

  // ── Menús ─────────────────────────────────────────────────
  // GET /api/v1/menus
  @Get()
  findAll() {
    return this.menusService.findAll();
  }

  // GET /api/v1/menus/vigente
  @Get('vigente')
  getVigente() {
    return this.menusService.findVigente();
  }

  // GET /api/v1/menus/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.findById(id);
  }

  // POST /api/v1/menus
  @Post()
  @Roles('tecnico_mineduc')
  crear(@Body() dto: CreateMenuDto, @Req() req: any) {
    return this.menusService.crear(dto, req.user.sub);
  }

  // PATCH /api/v1/menus/:id/publicar
  @Patch(':id/publicar')
  @Roles('tecnico_mineduc')
  publicar(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.publicar(id);
  }

  // PATCH /api/v1/menus/:id/vigente
  @Patch(':id/vigente')
  @Roles('tecnico_mineduc')
  marcarVigente(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.marcarVigente(id);
  }
}