import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export enum RolUsuario {
  TECNICO    = 'tecnico_mineduc',
  DIRECTOR   = 'director',
  DOCENTE    = 'docente_encargado',
  SECRETARIA = 'secretaria_opf',
  SUPERVISOR = 'supervisor',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 60 })
  username: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'nombre_completo', length: 150 })
  nombreCompleto: string;

  @Column({ nullable: true, unique: true, length: 150 })
  correo: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'ultimo_acceso', nullable: true, type: 'timestamptz' })
  ultimoAcceso: Date;

  @Column({ name: 'refresh_token_hash', nullable: true })
  refreshTokenHash: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}