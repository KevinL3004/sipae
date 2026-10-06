import {
    Controller, Get, Post, Patch,
    Param, Body, UseGuards, ParseUUIDPipe, Req
} from '@nestjs/common';
import { LiquidacionesService } from './liquidaciones.service.js';
import { CreateLiquidacionDto } from './dto/create-liquidacion.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('liquidaciones')
export class LiquidacionesController {
    constructor(private readonly liquidacionesService: LiquidacionesService) { }

    // GET /api/v1/liquidaciones/escuela/:escuelaId
    @Get('escuela/:escuelaId')
    getByEscuela(@Param('escuelaId', ParseUUIDPipe) id: string) {
        return this.liquidacionesService.getByEscuela(id);
    }

    // GET /api/v1/liquidaciones/tecnico/resumen
    @Get('tecnico/resumen')
    @Roles('tecnico_mineduc', 'supervisor')
    getResumenTecnico(@Req() req: any) {
        return this.liquidacionesService.getResumenTecnico(req.user.sub);
    }

    // GET /api/v1/liquidaciones/:id
    @Get(':id')
    getById(@Param('id', ParseUUIDPipe) id: string) {
        return this.liquidacionesService.getById(id);
    }

    // POST /api/v1/liquidaciones/generar
    @Post('generar')
    @Roles('tecnico_mineduc', 'director', 'secretaria_opf')
    generar(@Body() dto: CreateLiquidacionDto, @Req() req: any) {
        return this.liquidacionesService.generar(dto, req.user.sub);
    }

    // PATCH /api/v1/liquidaciones/:id/enviar
    @Patch(':id/enviar')
    @Roles('director', 'secretaria_opf')
    enviar(@Param('id', ParseUUIDPipe) id: string) {
        return this.liquidacionesService.enviar(id);
    }

    // PATCH /api/v1/liquidaciones/:id/aprobar
    @Patch(':id/aprobar')
    @Roles('tecnico_mineduc')
    aprobar(@Param('id', ParseUUIDPipe) id: string) {
        return this.liquidacionesService.aprobar(id);
    }

    // PATCH /api/v1/liquidaciones/:id/observar
    @Patch(':id/observar')
    @Roles('tecnico_mineduc')
    observar(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('observaciones') observaciones: string,
    ) {
        return this.liquidacionesService.observar(id, observaciones);
    }
}