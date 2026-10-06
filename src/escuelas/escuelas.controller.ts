import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, UseGuards, ParseUUIDPipe
} from '@nestjs/common';
import { EscuelasService } from './escuelas.service.js';
import { CreateEscuelaDto } from './dto/create-escuela.dto.js';
import { UpdateEscuelaDto } from './dto/update-escuela.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('escuelas')
export class EscuelasController {
    constructor(private readonly escuelasService: EscuelasService) { }

    // GET /api/v1/escuelas
    @Get()
    findAll() {
        return this.escuelasService.findAll();
    }

    // GET /api/v1/escuelas/:id
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.escuelasService.findById(id);
    }

    // GET /api/v1/escuelas/:id/usuarios
    @Get(':id/usuarios')
    getUsuarios(@Param('id', ParseUUIDPipe) id: string) {
        return this.escuelasService.getUsuariosPorEscuela(id);
    }

    // POST /api/v1/escuelas
    @Post()
    @Roles('tecnico_mineduc')
    create(@Body() dto: CreateEscuelaDto) {
        return this.escuelasService.crear(dto);
    }

    // POST /api/v1/escuelas/:id/usuarios
    @Post(':id/usuarios')
    @Roles('tecnico_mineduc', 'director')
    asignarUsuario(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('usuarioId') usuarioId: string,
    ) {
        return this.escuelasService.asignarUsuario(id, usuarioId);
    }

    // PATCH /api/v1/escuelas/:id
    @Patch(':id')
    @Roles('tecnico_mineduc')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateEscuelaDto,
    ) {
        return this.escuelasService.actualizar(id, dto);
    }

    // DELETE /api/v1/escuelas/:id
    @Delete(':id')
    @Roles('tecnico_mineduc')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.escuelasService.desactivar(id);
    }
}