import {
    Controller, Get, Post, Patch,
    Param, Body, Query, UseGuards, ParseUUIDPipe, Req
} from '@nestjs/common';
import { InventarioService } from './inventario.service.js';
import { CreateMovimientoDto } from './dto/create-movimiento.dto.js';
import { UpdateStockMinimoDto } from './dto/update-stock-minimo.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario')
export class InventarioController {
    constructor(private readonly inventarioService: InventarioService) { }

    // GET /api/v1/inventario/:escuelaId
    @Get(':escuelaId')
    getByEscuela(@Param('escuelaId', ParseUUIDPipe) escuelaId: string) {
        return this.inventarioService.getByEscuela(escuelaId);
    }

    // GET /api/v1/inventario/:escuelaId/alertas
    @Get(':escuelaId/alertas')
    getAlertas(@Param('escuelaId', ParseUUIDPipe) escuelaId: string) {
        return this.inventarioService.getAlertas(escuelaId);
    }

    // GET /api/v1/inventario/:escuelaId/movimientos
    @Get(':escuelaId/movimientos')
    getMovimientos(
        @Param('escuelaId', ParseUUIDPipe) escuelaId: string,
        @Query('alimentoId') alimentoId?: string,
    ) {
        return this.inventarioService.getMovimientos(escuelaId, alimentoId);
    }

    // POST /api/v1/inventario/movimiento
    @Post('movimiento')
    @Roles('tecnico_mineduc', 'director', 'docente_encargado')
    registrarMovimiento(@Body() dto: CreateMovimientoDto, @Req() req: any) {
        return this.inventarioService.registrarMovimiento(dto, req.user.sub);
    }

    // PATCH /api/v1/inventario/stock-minimo
    @Patch('stock-minimo')
    @Roles('tecnico_mineduc', 'director', 'docente_encargado')
    actualizarStockMinimo(@Body() dto: UpdateStockMinimoDto) {
        return this.inventarioService.actualizarStockMinimo(dto);
    }
}