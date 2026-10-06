import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn
} from 'typeorm';
import type { CompraRealizada } from './compra-realizada.entity.js';
import { Alimento } from '../menus/alimento.entity.js';

@Entity('items_compra')
export class ItemCompra {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne('CompraRealizada', 'items', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'compra_id' })
    compra: CompraRealizada;

    @ManyToOne(() => Alimento, { eager: true })
    @JoinColumn({ name: 'alimento_id' })
    alimento: Alimento;

    @Column({ name: 'cantidad_comprada', type: 'numeric', precision: 10, scale: 3 })
    cantidadComprada: number;

    @Column({ length: 20 })
    unidad: string;

    @Column({ name: 'precio_unitario_q', type: 'numeric', precision: 8, scale: 2 })
    precioUnitarioQ: number;

    @Column({
        name: 'subtotal_q', type: 'numeric', precision: 12, scale: 2,
        generatedType: 'STORED',
        asExpression: 'ROUND(cantidad_comprada * precio_unitario_q, 2)',
        nullable: true,
    })
    subtotalQ: number;
}