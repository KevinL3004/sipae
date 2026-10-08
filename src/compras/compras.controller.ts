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
import { ComprasService } from './compras.service.js';
import { CreateAsignacionDto } from './dto/create-asignacion.dto.js';
import { CreateProveedorDto } from './dto/create-proveedor.dto.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { CreateCompraDto } from './dto/create-compra.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

const invoiceDirectory = resolve(process.cwd(), 'uploads/invoices');
mkdirSync(invoiceDirectory, { recursive: true });
const allowedInvoiceMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

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

    @Post('realizadas/:id/factura')
    @Roles('tecnico_mineduc', 'director', 'secretaria_opf')
    @UseInterceptors(FileInterceptor('factura', {
        storage: diskStorage({
            destination: invoiceDirectory,
            filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
        }),
        limits: { fileSize: 15 * 1024 * 1024, files: 1 },
        fileFilter: (_request, file, callback) => {
            const valid = allowedInvoiceMimeTypes.has(file.mimetype);
            callback(valid ? null : new BadRequestException('La factura debe ser PDF, JPEG, PNG o WebP'), valid);
        },
    }))
    async cargarFactura(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() file: Express.Multer.File) {
        try {
            const compra = await this.comprasService.cargarFactura(id, file);
            return { ok: true, mensaje: 'Factura adjuntada correctamente', data: { compraId: compra.id, nombre: compra.facturaNombreOriginal } };
        } catch (error) {
            if (file?.path) unlinkSync(file.path);
            throw error;
        }
    }

    @Get('realizadas/:id/factura')
    @Roles('tecnico_mineduc', 'director', 'secretaria_opf')
    async descargarFactura(@Param('id', ParseUUIDPipe) id: string, @Res() response: Response) {
        const compra = await this.comprasService.getFactura(id);
        const filePath = resolve(compra.imagenFactura);
        if (!filePath.startsWith(`${invoiceDirectory}/`)) {
            throw new BadRequestException('La ruta de la factura no es válida');
        }
        return response.download(filePath, basename(compra.facturaNombreOriginal ?? filePath));
    }

    @Get('realizadas/:id/conciliacion')
    @Roles('tecnico_mineduc', 'director', 'secretaria_opf')
    conciliacion(@Param('id', ParseUUIDPipe) id: string) {
        return this.comprasService.getConciliacion(id);
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