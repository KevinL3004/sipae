import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn, OneToMany
} from 'typeorm';
import { Proveedor } from './proveedor.entity.js';
import { Usuario } from '../users/usuario.entity.js';
import type { ItemCompra } from './item-compra.entity.js';

export enum EstadoCompra {
    REGISTRADA = 'registrada',
    VERIFICADA = 'verificada',
    RECHAZADA = 'rechazada',
}

@Entity('compras_realizadas')
export class CompraRealizada {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne('PlanCompra', { eager: true })
    @JoinColumn({ name: 'plan_id' })
    plan: any;

    @ManyToOne(() => Proveedor, { nullable: true, eager: true })
    @JoinColumn({ name: 'proveedor_id' })
    proveedor: Proveedor;

    @ManyToOne(() => Usuario, { eager: false })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column({ name: 'fecha_compra', type: 'date' })
    fechaCompra: string;

    @Column({ name: 'total_gastado_q', type: 'numeric', precision: 12, scale: 2 })
    totalGastadoQ: number;

    @Column({ name: 'numero_factura', nullable: true, length: 60 })
    numeroFactura: string;

    @Column({ name: 'imagen_factura', nullable: true, type: 'text' })
    imagenFactura: string;

    @Column({ name: 'factura_nombre_original', nullable: true, length: 255 })
    facturaNombreOriginal: string;

    @Column({ name: 'factura_mime_type', nullable: true, length: 100 })
    facturaMimeType: string;

    @Column({ name: 'factura_tamano_bytes', type: 'bigint', nullable: true })
    facturaTamanoBytes: number;

    @Column({ type: 'enum', enum: EstadoCompra, default: EstadoCompra.REGISTRADA })
    estado: EstadoCompra;

    @Column({ nullable: true, type: 'text' })
    observaciones: string;

    @OneToMany('ItemCompra', 'compra', { cascade: true, eager: true })
    items: ItemCompra[];

    @CreateDateColumn({ name: 'registrado_en', type: 'timestamptz' })
    registradoEn: Date;
}