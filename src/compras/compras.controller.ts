import {
    Controller, Get, Post, Patch,
    Param, Body, UseGuards, ParseUUIDPipe, Req
} from '@nestjs/common';
import { ComprasService } from './compras.service.js';
import { CreateAsignacionDto } from './dto/create-asignacion.dto.js';
import { CreateProveedorDto } from './dto/create-proveedor.dto.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { CreateCompraDto } from './dto/create-compra.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compras')
export class ComprasController {
    constructor(private readonly comprasService: ComprasService) { }

    // ── Asignaciones ──────────────────────────────────────────
    @Get('asignaciones/:escuelaId')
    getAsignaciones(@Param('escuelaId', ParseUUIDPipe) id: string) {
        return this.comprasService.getAsignaciones(id);
    }

    @Get('asignaciones/:escuelaId/activa')
    getAsignacionActiva(@Param('escuelaId', ParseUUIDPipe) id: string) {
        return this.comprasService.getAsignacionActiva(id);
    }

    @Post('asignaciones')
    @Roles('tecnico_mineduc')
    crearAsignacion(@Body() dto: CreateAsignacionDto, @Req() req: any) {
        return this.comprasService.crearAsignacion(dto, req.user.sub);
    }

    @Patch('asignaciones/:id/cerrar')
    @Roles('tecnico_mineduc')
    cerrarAsignacion(@Param('id', ParseUUIDPipe) id: string) {
        return this.comprasService.cerrarAsignacion(id);
    }

    // ── Proveedores ───────────────────────────────────────────
    @Get('proveedores/:escuelaId')
    getProveedores(@Param('escuelaId', ParseUUIDPipe) id: string) {
        return this.comprasService.getProveedores(id);
    }

    @Post('proveedores')
    @Roles('tecnico_mineduc', 'director', 'secretaria_opf')
    crearProveedor(@Body() dto: CreateProveedorDto) {
        return this.comprasService.crearProveedor(dto);
    }

    @Patch('proveedores/:id/toggle')
    @Roles('tecnico_mineduc', 'director')
    toggleProveedor(@Param('id', ParseUUIDPipe) id: string) {
        return this.comprasService.toggleProveedor(id);
    }

    // ── Planes ────────────────────────────────────────────────
    @Get('planes/:escuelaId')
    getPlanes(@Param('escuelaId', ParseUUIDPipe) id: string) {
        return this.comprasService.getPlanes(id);
    }

    @Get('planes/detalle/:id')
    getPlan(@Param('id', ParseUUIDPipe) id: string) {
        return this.comprasService.getPlanById(id);
    }

    @Post('planes')
    @Roles('tecnico_mineduc', 'director', 'secretaria_opf')
    crearPlan(@Body() dto: CreatePlanDto, @Req() req: any) {
        return this.comprasService.crearPlan(dto, req.user.sub);
    }

    @Patch('planes/:id/aprobar')
    @Roles('tecnico_mineduc', 'director')
    aprobarPlan(@Param('id', ParseUUIDPipe) id: string) {
        return this.comprasService.aprobarPlan(id);
    }

    // ── Compras realizadas ────────────────────────────────────
    @Get('realizadas/:escuelaId')
    getCompras(@Param('escuelaId', ParseUUIDPipe) id: string) {
        return this.comprasService.getCompras(id);
    }

    @Post('realizadas')
    @Roles('tecnico_mineduc', 'director', 'secretaria_opf')
    registrarCompra(@Body() dto: CreateCompraDto, @Req() req: any) {
        return this.comprasService.registrarCompra(dto, req.user.sub);
    }

    @Patch('realizadas/:id/verificar')
    @Roles('tecnico_mineduc', 'director')
    verificarCompra(@Param('id', ParseUUIDPipe) id: string) {
        return this.comprasService.verificarCompra(id);
    }

    @Patch('realizadas/:id/rechazar')
    @Roles('tecnico_mineduc', 'director')
    rechazarCompra(@Param('id', ParseUUIDPipe) id: string) {
        return this.comprasService.rechazarCompra(id);
    }

    // ── Resumen presupuestario ────────────────────────────────
    @Get('resumen/:escuelaId')
    getResumen(@Param('escuelaId', ParseUUIDPipe) id: string) {
        return this.comprasService.getResumenPresupuestario(id);
    }
}