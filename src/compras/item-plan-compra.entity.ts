import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn
} from 'typeorm';
import type { PlanCompra } from './plan-compra.entity.js';
import { Alimento } from '../menus/alimento.entity.js';

@Entity('items_plan_compra')
export class ItemPlanCompra {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne('PlanCompra', 'items', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'plan_id' })
    plan: PlanCompra;

    @ManyToOne(() => Alimento, { eager: true })
    @JoinColumn({ name: 'alimento_id' })
    alimento: Alimento;

    @Column({ name: 'cantidad_a_comprar', type: 'numeric', precision: 10, scale: 3 })
    cantidadAComprar: number;

    @Column({ length: 20 })
    unidad: string;

    @Column({ name: 'precio_unitario_q', type: 'numeric', precision: 8, scale: 2, nullable: true })
    precioUnitarioQ: number;

    @Column({
        name: 'subtotal_q', type: 'numeric', precision: 12, scale: 2,
        generatedType: 'STORED',
        asExpression: 'ROUND(cantidad_a_comprar * precio_unitario_q, 2)',
        nullable: true,
    })
    subtotalQ: number;
}