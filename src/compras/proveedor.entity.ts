import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Escuela } from '../escuelas/escuela.entity.js';

@Entity('proveedores')
export class Proveedor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Escuela, { eager: false })
    @JoinColumn({ name: 'escuela_id' })
    escuela: Escuela;

    @Column({ length: 200 })
    nombre: string;

    @Column({ nullable: true, length: 150 })
    contacto: string;

    @Column({ nullable: true, length: 30 })
    telefono: string;

    @Column({ nullable: true, length: 30 })
    nit: string;

    @Column({ name: 'productos_que_provee', nullable: true, type: 'text' })
    productosQueProvee: string;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
    creadoEn: Date;
}