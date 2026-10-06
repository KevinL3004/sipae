import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, ParseUUIDPipe
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/v1/users
  @Get()
  @Roles('tecnico_mineduc', 'director')
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/v1/users/me
  @Get('me')
  getMe(@GetUser() user: any) {
    return this.usersService.findById(user.sub);
  }

  // GET /api/v1/users/:id
  @Get(':id')
  @Roles('tecnico_mineduc', 'director')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  // POST /api/v1/users
  @Post()
  @Roles('tecnico_mineduc', 'director')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.crear(dto);
  }

  // PATCH /api/v1/users/:id
  @Patch(':id')
  @Roles('tecnico_mineduc', 'director')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.actualizar(id, dto);
  }

  // DELETE /api/v1/users/:id
  @Delete(':id')
  @Roles('tecnico_mineduc')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.desactivar(id);
  }
}