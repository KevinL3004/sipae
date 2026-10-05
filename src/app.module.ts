import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { EscuelasModule } from './escuelas/escuelas.module.js';
import { MenusModule } from './menus/menus.module.js';
import { InventarioModule } from './inventario/inventario.module.js';
import { ComprasModule } from './compras/compras.module.js';
import { LiquidacionesModule } from './liquidaciones/liquidaciones.module.js';

// Compatibilidad con __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
        entities: [
          __dirname + '/**/*.entity{.ts,.js}',
        ],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    EscuelasModule,
    MenusModule,
    InventarioModule,
    ComprasModule,
    LiquidacionesModule,
  ],
})

export class AppModule { }

