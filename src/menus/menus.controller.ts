import {
  BadRequestException, Controller, Get, Post, Patch,
  Param, Body, UseGuards, ParseUUIDPipe, Req, UploadedFile,
  UseInterceptors, Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { mkdirSync, unlinkSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { MenusService } from './menus.service.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { CreateAlimentoDto } from './dto/create-alimento.dto.js';
import { CreateMenuDocumentDto, DistributeMenuDto } from './dto/create-menu-document.dto.js';
import { ReplaceMenuRacionItemsDto } from './dto/create-menu-racion-item.dto.js';
import { SugerirCompraDto } from './dto/sugerir-compra.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

const menuDocumentDirectory = resolve(process.cwd(), 'uploads/official-menus');
mkdirSync(menuDocumentDirectory, { recursive: true });

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post('documentos')
  @Roles('tecnico_mineduc')
  @UseInterceptors(FileInterceptor('documento', {
    storage: diskStorage({
      destination: menuDocumentDirectory,
      filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 25 * 1024 * 1024, files: 1 },
    fileFilter: (_request, file, callback) => {
      const isPdf = file.mimetype === 'application/pdf' && extname(file.originalname).toLowerCase() === '.pdf';
      callback(isPdf ? null : new BadRequestException('Sólo se permiten documentos PDF'), isPdf);
    },
  }))
  async cargarDocumento(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMenuDocumentDto,
    @Req() req: any,
  ) {
    try {
      const menu = await this.menusService.crearDesdeDocumento(dto, file, req.user.sub);
      return { ok: true, mensaje: 'Documento oficial cargado como borrador', data: menu };
    } catch (error) {
      if (file?.path) unlinkSync(file.path);
      throw error;
    }
  }

  @Get('escuela/:escuelaId')
  getDistribuidosPorEscuela(@Param('escuelaId', ParseUUIDPipe) escuelaId: string, @Req() req: any) {
    return this.menusService.getDistribuidosPorEscuela(escuelaId, req.user.sub, req.user.rol);
  }

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
  findAll(@Req() req: any) {
    return this.menusService.findVisibleForUser(req.user.sub, req.user.rol);
  }

  // GET /api/v1/menus/vigente
  @Get('vigente')
  async getVigente(@Req() req: any) {
    const menus = await this.menusService.findVisibleForUser(req.user.sub, req.user.rol);
    return menus.find(menu => menu.estado === 'vigente') ?? null;
  }

  // GET /api/v1/menus/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.menusService.findVisibleById(id, req.user.sub, req.user.rol);
  }

  // POST /api/v1/menus
  @Post()
  @Roles('tecnico_mineduc')
  crear(@Body() dto: CreateMenuDto, @Req() req: any) {
    return this.menusService.crear(dto, req.user.sub);
  }

  @Post(':id/distribuciones')
  @Roles('tecnico_mineduc')
  distribuir(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DistributeMenuDto,
    @Req() req: any,
  ) {
    return this.menusService.distribuir(id, dto, req.user.sub);
  }

  @Post(':id/opciones-racion')
  @Roles('tecnico_mineduc')
  guardarOpcionesRacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceMenuRacionItemsDto,
  ) {
    return this.menusService.reemplazarItemsRacion(id, dto.items);
  }

  @Get(':id/documento')
  async descargarDocumento(@Param('id', ParseUUIDPipe) id: string, @Req() req: any, @Res() response: Response) {
    const menu = await this.menusService.getDocumento(id, req.user.sub, req.user.rol);
    const filePath = resolve(menu.documentoPath);
    if (!filePath.startsWith(`${menuDocumentDirectory}/`)) {
      throw new BadRequestException('La ruta del documento no es válida');
    }
    return response.download(filePath, basename(menu.documentoNombre));
  }

  @Post(':id/sugerencia-compra')
  sugerirCompraPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SugerirCompraDto,
    @Req() req: any,
  ) {
    return this.menusService.sugerirItemsPlan(id, body.opcionCodigo, body.grupoBeneficiario, body.estudiantes, req.user.sub, req.user.rol);
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