-- ============================================================
-- SIPAE — Sistema de Gestión, Ejecución y Rendición de Cuentas
-- del Programa Alimentario Escolar
-- PostgreSQL 16
-- Universidad Mariano Gálvez de Guatemala
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE rol_usuario       AS ENUM ('tecnico_mineduc','director','docente_encargado','secretaria_opf','supervisor');
CREATE TYPE tipo_movimiento   AS ENUM ('ingreso','salida');
CREATE TYPE estado_menu       AS ENUM ('borrador','publicado','vigente','vencido');
CREATE TYPE dia_semana        AS ENUM ('lunes','martes','miercoles','jueves','viernes');
CREATE TYPE estado_asignacion AS ENUM ('pendiente','activa','cerrada','auditada');
CREATE TYPE estado_plan       AS ENUM ('borrador','optimizado','aprobado','ejecutado');
CREATE TYPE estado_compra     AS ENUM ('registrada','verificada','rechazada');
CREATE TYPE estado_liquidacion AS ENUM ('borrador','enviada','aprobada','observada');
CREATE TYPE grupo_alimentario AS ENUM ('leguminosas','cereales','lacteos','carnes','frutas','verduras','grasas_aceites','bebidas','otros');

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    username            VARCHAR(60) NOT NULL UNIQUE,
    password_hash       TEXT        NOT NULL,
    nombre_completo     VARCHAR(150) NOT NULL,
    correo              VARCHAR(150) UNIQUE,
    rol                 rol_usuario NOT NULL,
    activo              BOOLEAN     NOT NULL DEFAULT TRUE,
    ultimo_acceso       TIMESTAMPTZ,
    refresh_token_hash  TEXT,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_username_len CHECK (char_length(username) >= 4)
);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_rol      ON usuarios(rol);

-- ============================================================
-- TABLA: tecnicos_mineduc
-- ============================================================
CREATE TABLE tecnicos_mineduc (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id       UUID        NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_empleado  VARCHAR(30) UNIQUE,
    telefono         VARCHAR(20),
    region_asignada  VARCHAR(100) NOT NULL,
    departamento     VARCHAR(80),
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tecnicos_usuario ON tecnicos_mineduc(usuario_id);

-- ============================================================
-- TABLA: escuelas
-- ============================================================
CREATE TABLE escuelas (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_mineduc   VARCHAR(30) NOT NULL UNIQUE,
    nombre           VARCHAR(200) NOT NULL,
    municipio        VARCHAR(100) NOT NULL,
    departamento     VARCHAR(80)  NOT NULL,
    direccion        TEXT,
    matricula_actual INT         NOT NULL DEFAULT 0 CHECK (matricula_actual >= 0),
    tecnico_id       UUID        REFERENCES tecnicos_mineduc(id) ON DELETE SET NULL,
    activa           BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_escuelas_tecnico    ON escuelas(tecnico_id);
CREATE INDEX idx_escuelas_departamento ON escuelas(departamento);
CREATE INDEX idx_escuelas_activa     ON escuelas(activa);

-- ============================================================
-- TABLA: usuarios_escuela
-- ============================================================
CREATE TABLE usuarios_escuela (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id  UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    escuela_id  UUID        NOT NULL REFERENCES escuelas(id) ON DELETE CASCADE,
    activo      BOOLEAN     NOT NULL DEFAULT TRUE,
    asignado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_escuela UNIQUE (usuario_id, escuela_id)
);
CREATE INDEX idx_ue_usuario ON usuarios_escuela(usuario_id);
CREATE INDEX idx_ue_escuela ON usuarios_escuela(escuela_id);

-- ============================================================
-- TABLA: alimentos
-- ============================================================
CREATE TABLE alimentos (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre              VARCHAR(150)    NOT NULL UNIQUE,
    grupo               grupo_alimentario NOT NULL,
    kcal_por_100g       NUMERIC(8,2)    NOT NULL CHECK (kcal_por_100g >= 0),
    proteina_g          NUMERIC(7,2)    NOT NULL DEFAULT 0 CHECK (proteina_g >= 0),
    carbohidratos_g     NUMERIC(7,2)    NOT NULL DEFAULT 0 CHECK (carbohidratos_g >= 0),
    grasas_g            NUMERIC(7,2)    NOT NULL DEFAULT 0 CHECK (grasas_g >= 0),
    precio_ref_q        NUMERIC(8,2)    CHECK (precio_ref_q > 0),
    precio_ref_fuente   VARCHAR(200),
    precio_ref_fecha    DATE,
    precio_ref_zona     VARCHAR(120),
    tipo_compra         VARCHAR(20)     NOT NULL DEFAULT 'por_definir',
    origen_compra       VARCHAR(30)     NOT NULL DEFAULT 'por_definir',
    dias_vida_util      SMALLINT,
    unidad_inventario   VARCHAR(20)     NOT NULL DEFAULT 'lb',
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    fuente_nutricional  VARCHAR(100)    DEFAULT 'INCAP 2021',
    creado_en           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_alimentos_grupo  ON alimentos(grupo);
CREATE INDEX idx_alimentos_activo ON alimentos(activo);

-- ============================================================
-- TABLA: menus_oficiales
-- ============================================================
CREATE TABLE menus_oficiales (
    id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tecnico_id     UUID        NOT NULL REFERENCES tecnicos_mineduc(id) ON DELETE RESTRICT,
    nombre         VARCHAR(200) NOT NULL,
    descripcion    TEXT,
    fecha_inicio   DATE        NOT NULL,
    fecha_fin      DATE        NOT NULL,
    estado         estado_menu NOT NULL DEFAULT 'borrador',
    nivel_educativo VARCHAR(40),
    departamento   VARCHAR(100),
    grupo_beneficiario VARCHAR(120),
    numero_entrega VARCHAR(80),
    dias_cobertura SMALLINT,
    monto_diario_alumno_q NUMERIC(8,2),
    documento_path TEXT,
    documento_nombre VARCHAR(255),
    documento_mime_type VARCHAR(100),
    documento_tamano_bytes BIGINT,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fechas_menu CHECK (fecha_fin > fecha_inicio)
);
CREATE INDEX idx_menus_tecnico ON menus_oficiales(tecnico_id);
CREATE INDEX idx_menus_estado  ON menus_oficiales(estado);
CREATE INDEX idx_menus_fechas  ON menus_oficiales(fecha_inicio, fecha_fin);

CREATE TABLE menus_escuelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus_oficiales(id) ON DELETE CASCADE,
    escuela_id UUID NOT NULL REFERENCES escuelas(id) ON DELETE CASCADE,
    distribuido_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    distribuido_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_menu_escuela UNIQUE (menu_id, escuela_id)
);
CREATE INDEX idx_menus_escuelas_escuela ON menus_escuelas(escuela_id, distribuido_en DESC);

-- ============================================================
-- TABLA: dias_menu
-- ============================================================
CREATE TABLE dias_menu (
    id                    UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id               UUID       NOT NULL REFERENCES menus_oficiales(id) ON DELETE CASCADE,
    semana_numero         SMALLINT   NOT NULL CHECK (semana_numero BETWEEN 1 AND 5),
    dia                   dia_semana NOT NULL,
    descripcion_refaccion TEXT       NOT NULL,
    kcal_estimadas        INT        CHECK (kcal_estimadas > 0),
    observaciones         TEXT,
    CONSTRAINT uq_dia_menu UNIQUE (menu_id, semana_numero, dia)
);
CREATE INDEX idx_dias_menu_id ON dias_menu(menu_id);

-- ============================================================
-- TABLA: ingredientes_dia
-- ============================================================
CREATE TABLE ingredientes_dia (
    id                        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    dia_menu_id               UUID         NOT NULL REFERENCES dias_menu(id) ON DELETE CASCADE,
    alimento_id               UUID         NOT NULL REFERENCES alimentos(id) ON DELETE RESTRICT,
    cantidad_por_estudiante_g NUMERIC(8,3) NOT NULL CHECK (cantidad_por_estudiante_g > 0),
    unidad                    VARCHAR(20)  NOT NULL DEFAULT 'g',
    CONSTRAINT uq_ingrediente_dia UNIQUE (dia_menu_id, alimento_id)
);
CREATE INDEX idx_ing_dia       ON ingredientes_dia(dia_menu_id);
CREATE INDEX idx_ing_alimento  ON ingredientes_dia(alimento_id);

CREATE TABLE menus_racion_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus_oficiales(id) ON DELETE CASCADE,
    opcion_codigo VARCHAR(20) NOT NULL,
    grupo_beneficiario VARCHAR(120) NOT NULL,
    alimento_nombre VARCHAR(150) NOT NULL,
    presentacion VARCHAR(120) NOT NULL,
    cantidad NUMERIC(10,3) NOT NULL CHECK (cantidad > 0),
    unidad VARCHAR(20) NOT NULL,
    origen_compra VARCHAR(30) NOT NULL DEFAULT 'por_definir',
    grupo_nutriente VARCHAR(80),
    alimento_id UUID REFERENCES alimentos(id) ON DELETE SET NULL
);
CREATE INDEX idx_menu_racion_opcion ON menus_racion_items(menu_id, opcion_codigo, grupo_beneficiario);

-- ============================================================
-- TABLA: asignaciones_presupuesto
-- ============================================================
CREATE TABLE asignaciones_presupuesto (
    id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
    escuela_id      UUID              NOT NULL REFERENCES escuelas(id) ON DELETE RESTRICT,
    menu_id         UUID              NOT NULL REFERENCES menus_oficiales(id) ON DELETE RESTRICT,
    tecnico_id      UUID              NOT NULL REFERENCES tecnicos_mineduc(id) ON DELETE RESTRICT,
    monto_total_q   NUMERIC(12,2)     NOT NULL CHECK (monto_total_q > 0),
    periodo_inicio  DATE              NOT NULL,
    periodo_fin     DATE              NOT NULL,
    estado          estado_asignacion NOT NULL DEFAULT 'pendiente',
    notas           TEXT,
    asignado_en     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_periodo_asig CHECK (periodo_fin > periodo_inicio),
    CONSTRAINT uq_asignacion    UNIQUE (escuela_id, menu_id, periodo_inicio)
);
CREATE INDEX idx_asig_escuela ON asignaciones_presupuesto(escuela_id);
CREATE INDEX idx_asig_menu    ON asignaciones_presupuesto(menu_id);
CREATE INDEX idx_asig_estado  ON asignaciones_presupuesto(estado);

-- ============================================================
-- TABLA: inventario
-- ============================================================
CREATE TABLE inventario (
    id                   UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    escuela_id           UUID          NOT NULL REFERENCES escuelas(id) ON DELETE CASCADE,
    alimento_id          UUID          NOT NULL REFERENCES alimentos(id) ON DELETE RESTRICT,
    existencia_actual    NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (existencia_actual >= 0),
    stock_minimo         NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    ultima_actualizacion TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_inventario UNIQUE (escuela_id, alimento_id)
);
CREATE INDEX idx_inv_escuela  ON inventario(escuela_id);
CREATE INDEX idx_inv_alimento ON inventario(alimento_id);
CREATE INDEX idx_inv_stock_bajo ON inventario(escuela_id)
    WHERE existencia_actual <= stock_minimo;

-- ============================================================
-- TABLA: movimientos_inventario
-- ============================================================
CREATE TABLE movimientos_inventario (
    id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventario_id UUID            NOT NULL REFERENCES inventario(id) ON DELETE RESTRICT,
    usuario_id    UUID            NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    tipo          tipo_movimiento NOT NULL,
    cantidad      NUMERIC(10,3)   NOT NULL CHECK (cantidad > 0),
    motivo        VARCHAR(200),
    observaciones TEXT,
    registrado_en TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mov_inventario ON movimientos_inventario(inventario_id);
CREATE INDEX idx_mov_usuario    ON movimientos_inventario(usuario_id);
CREATE INDEX idx_mov_tipo       ON movimientos_inventario(tipo);
CREATE INDEX idx_mov_fecha      ON movimientos_inventario(registrado_en DESC);

-- ============================================================
-- TABLA: proveedores
-- ============================================================
CREATE TABLE proveedores (
    id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    escuela_id           UUID         NOT NULL REFERENCES escuelas(id) ON DELETE CASCADE,
    nombre               VARCHAR(200) NOT NULL,
    contacto             VARCHAR(150),
    telefono             VARCHAR(30),
    nit                  VARCHAR(30),
    productos_que_provee TEXT,
    activo               BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prov_escuela ON proveedores(escuela_id);
CREATE INDEX idx_prov_activo  ON proveedores(activo);

-- ============================================================
-- TABLA: planes_compra
-- ============================================================
CREATE TABLE planes_compra (
    id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    escuela_id        UUID         NOT NULL REFERENCES escuelas(id) ON DELETE RESTRICT,
    asignacion_id     UUID         NOT NULL REFERENCES asignaciones_presupuesto(id) ON DELETE RESTRICT,
    usuario_id        UUID         NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    semana_inicio     DATE         NOT NULL,
    semana_fin        DATE         NOT NULL,
    num_estudiantes   INT          NOT NULL CHECK (num_estudiantes > 0),
    costo_estimado_q  NUMERIC(12,2) CHECK (costo_estimado_q >= 0),
    estado            estado_plan  NOT NULL DEFAULT 'borrador',
    notas_optimizacion TEXT,
    generado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    actualizado_en    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_semana_plan CHECK (semana_fin > semana_inicio)
);
CREATE INDEX idx_plan_escuela    ON planes_compra(escuela_id);
CREATE INDEX idx_plan_asignacion ON planes_compra(asignacion_id);
CREATE INDEX idx_plan_estado     ON planes_compra(estado);
CREATE INDEX idx_plan_semana     ON planes_compra(semana_inicio);

-- ============================================================
-- TABLA: items_plan_compra
-- ============================================================
CREATE TABLE items_plan_compra (
    id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id             UUID          NOT NULL REFERENCES planes_compra(id) ON DELETE CASCADE,
    alimento_id         UUID          NOT NULL REFERENCES alimentos(id) ON DELETE RESTRICT,
    cantidad_a_comprar  NUMERIC(10,3) NOT NULL CHECK (cantidad_a_comprar > 0),
    unidad              VARCHAR(20)   NOT NULL,
    precio_unitario_q   NUMERIC(8,2)  CHECK (precio_unitario_q > 0),
    subtotal_q          NUMERIC(12,2) GENERATED ALWAYS AS
                            (ROUND(cantidad_a_comprar * precio_unitario_q, 2)) STORED,
    frecuencia_compra   VARCHAR(20) NOT NULL DEFAULT 'por_definir',
    fecha_compra_sugerida DATE,
    observacion_sugerencia TEXT,
    CONSTRAINT uq_item_plan UNIQUE (plan_id, alimento_id)
);
CREATE INDEX idx_ipc_plan     ON items_plan_compra(plan_id);
CREATE INDEX idx_ipc_alimento ON items_plan_compra(alimento_id);

-- ============================================================
-- TABLA: compras_realizadas
-- ============================================================
CREATE TABLE compras_realizadas (
    id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id          UUID          NOT NULL REFERENCES planes_compra(id) ON DELETE RESTRICT,
    proveedor_id     UUID          REFERENCES proveedores(id) ON DELETE SET NULL,
    usuario_id       UUID          NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha_compra     DATE          NOT NULL,
    total_gastado_q  NUMERIC(12,2) NOT NULL CHECK (total_gastado_q > 0),
    numero_factura   VARCHAR(60),
    imagen_factura   TEXT,
    factura_nombre_original VARCHAR(255),
    factura_mime_type VARCHAR(100),
    factura_tamano_bytes BIGINT,
    estado           estado_compra NOT NULL DEFAULT 'registrada',
    observaciones    TEXT,
    registrado_en    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comp_plan      ON compras_realizadas(plan_id);
CREATE INDEX idx_comp_proveedor ON compras_realizadas(proveedor_id);
CREATE INDEX idx_comp_usuario   ON compras_realizadas(usuario_id);
CREATE INDEX idx_comp_fecha     ON compras_realizadas(fecha_compra DESC);
CREATE INDEX idx_comp_estado    ON compras_realizadas(estado);

-- ============================================================
-- TABLA: items_compra
-- ============================================================
CREATE TABLE items_compra (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    compra_id         UUID          NOT NULL REFERENCES compras_realizadas(id) ON DELETE CASCADE,
    alimento_id       UUID          NOT NULL REFERENCES alimentos(id) ON DELETE RESTRICT,
    cantidad_comprada NUMERIC(10,3) NOT NULL CHECK (cantidad_comprada > 0),
    unidad            VARCHAR(20)   NOT NULL,
    precio_unitario_q NUMERIC(8,2)  NOT NULL CHECK (precio_unitario_q > 0),
    subtotal_q        NUMERIC(12,2) GENERATED ALWAYS AS
                          (ROUND(cantidad_comprada * precio_unitario_q, 2)) STORED,
    CONSTRAINT uq_item_compra UNIQUE (compra_id, alimento_id)
);
CREATE INDEX idx_ic_compra   ON items_compra(compra_id);
CREATE INDEX idx_ic_alimento ON items_compra(alimento_id);

-- ============================================================
-- TABLA: liquidaciones
-- ============================================================
CREATE TABLE liquidaciones (
    id                UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
    escuela_id        UUID               NOT NULL REFERENCES escuelas(id) ON DELETE RESTRICT,
    asignacion_id     UUID               NOT NULL UNIQUE REFERENCES asignaciones_presupuesto(id) ON DELETE RESTRICT,
    generado_por      UUID               NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    periodo_inicio    DATE               NOT NULL,
    periodo_fin       DATE               NOT NULL,
    total_asignado_q  NUMERIC(12,2)      NOT NULL,
    total_gastado_q   NUMERIC(12,2)      NOT NULL DEFAULT 0,
    saldo_q           NUMERIC(12,2)      GENERATED ALWAYS AS
                          (ROUND(total_asignado_q - total_gastado_q, 2)) STORED,
    estado            estado_liquidacion NOT NULL DEFAULT 'borrador',
    url_pdf           TEXT,
    observaciones     TEXT,
    generado_en       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    enviado_en        TIMESTAMPTZ,
    CONSTRAINT chk_periodo_liq CHECK (periodo_fin > periodo_inicio)
);
CREATE INDEX idx_liq_escuela    ON liquidaciones(escuela_id);
CREATE INDEX idx_liq_asignacion ON liquidaciones(asignacion_id);
CREATE INDEX idx_liq_estado     ON liquidaciones(estado);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION fn_actualizar_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_usuarios_updated
    BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();
CREATE TRIGGER tg_escuelas_updated
    BEFORE UPDATE ON escuelas FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();
CREATE TRIGGER tg_menus_updated
    BEFORE UPDATE ON menus_oficiales FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();
CREATE TRIGGER tg_asig_updated
    BEFORE UPDATE ON asignaciones_presupuesto FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();
CREATE TRIGGER tg_planes_updated
    BEFORE UPDATE ON planes_compra FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();
CREATE TRIGGER tg_alimentos_updated
    BEFORE UPDATE ON alimentos FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

-- Trigger: aplicar movimiento al inventario
CREATE OR REPLACE FUNCTION fn_aplicar_movimiento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_existencia NUMERIC;
BEGIN
    SELECT existencia_actual INTO v_existencia
    FROM inventario WHERE id = NEW.inventario_id;

    IF NEW.tipo = 'ingreso' THEN
        UPDATE inventario
        SET existencia_actual    = existencia_actual + NEW.cantidad,
            ultima_actualizacion = NOW()
        WHERE id = NEW.inventario_id;
    ELSIF NEW.tipo = 'salida' THEN
        IF v_existencia < NEW.cantidad THEN
            RAISE EXCEPTION 'Existencia insuficiente. Disponible: %, Solicitado: %',
                v_existencia, NEW.cantidad;
        END IF;
        UPDATE inventario
        SET existencia_actual    = existencia_actual - NEW.cantidad,
            ultima_actualizacion = NOW()
        WHERE id = NEW.inventario_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_movimiento_inventario
    AFTER INSERT ON movimientos_inventario
    FOR EACH ROW EXECUTE FUNCTION fn_aplicar_movimiento();

-- Trigger: actualizar total_gastado en liquidacion al verificar compra
CREATE OR REPLACE FUNCTION fn_actualizar_liquidacion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_asignacion_id UUID;
BEGIN
    SELECT pc.asignacion_id INTO v_asignacion_id
    FROM planes_compra pc WHERE pc.id = NEW.plan_id;

    UPDATE liquidaciones
    SET total_gastado_q = (
        SELECT COALESCE(SUM(cr.total_gastado_q), 0)
        FROM compras_realizadas cr
        JOIN planes_compra pc ON cr.plan_id = pc.id
        WHERE pc.asignacion_id = v_asignacion_id
          AND cr.estado = 'verificada'
    )
    WHERE asignacion_id = v_asignacion_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_compra_liquidacion
    AFTER INSERT OR UPDATE OF estado ON compras_realizadas
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_liquidacion();

-- ============================================================
-- VISTAS
-- ============================================================

CREATE VIEW v_estado_inventario AS
SELECT
    e.nombre                                          AS escuela,
    e.codigo_mineduc,
    a.nombre                                          AS alimento,
    a.grupo,
    i.existencia_actual,
    i.stock_minimo,
    a.unidad_inventario                               AS unidad,
    CASE
        WHEN i.existencia_actual = 0                         THEN 'agotado'
        WHEN i.existencia_actual <= i.stock_minimo * 0.5     THEN 'critico'
        WHEN i.existencia_actual <= i.stock_minimo           THEN 'bajo'
        ELSE                                                      'normal'
    END                                               AS nivel_stock,
    ROUND((i.existencia_actual / NULLIF(i.stock_minimo,0)) * 100, 1) AS porcentaje_stock,
    i.ultima_actualizacion
FROM inventario i
JOIN escuelas  e ON i.escuela_id  = e.id
JOIN alimentos a ON i.alimento_id = a.id
WHERE e.activa = TRUE;

CREATE VIEW v_ejecucion_presupuestaria AS
SELECT
    e.nombre                                              AS escuela,
    ap.periodo_inicio,
    ap.periodo_fin,
    ap.monto_total_q                                      AS asignado_q,
    COALESCE(SUM(cr.total_gastado_q), 0)                  AS gastado_q,
    ap.monto_total_q - COALESCE(SUM(cr.total_gastado_q),0) AS saldo_q,
    ROUND(COALESCE(SUM(cr.total_gastado_q),0)
        / NULLIF(ap.monto_total_q,0) * 100, 1)           AS porcentaje_ejecutado,
    ap.estado
FROM asignaciones_presupuesto ap
JOIN escuelas e ON ap.escuela_id = e.id
LEFT JOIN planes_compra pc ON pc.asignacion_id = ap.id
LEFT JOIN compras_realizadas cr ON cr.plan_id = pc.id AND cr.estado = 'verificada'
GROUP BY e.nombre, ap.id, ap.periodo_inicio, ap.periodo_fin, ap.monto_total_q, ap.estado;

CREATE VIEW v_resumen_liquidaciones AS
SELECT
    e.nombre            AS escuela,
    e.codigo_mineduc,
    l.periodo_inicio,
    l.periodo_fin,
    l.total_asignado_q,
    l.total_gastado_q,
    l.saldo_q,
    l.estado,
    u.nombre_completo   AS generado_por,
    l.enviado_en
FROM liquidaciones l
JOIN escuelas e ON l.escuela_id   = e.id
JOIN usuarios u ON l.generado_por = u.id;

-- ============================================================
-- DATOS SEMILLA
-- ============================================================

-- Usuario admin (contraseña: Admin2025! — hash bcrypt generado por NestJS al arrancar)
INSERT INTO usuarios (id, username, password_hash, nombre_completo, correo, rol) VALUES
('a0000000-0000-0000-0000-000000000001','admin_sipae',
 '$2b$10$placeholder.hash.sera.reemplazado.por.nest',
 'Administrador SIPAE','admin@sipae.edu.gt','tecnico_mineduc');

-- Catálogo de alimentos INCAP 2021
INSERT INTO alimentos (nombre, grupo, kcal_por_100g, proteina_g, carbohidratos_g, grasas_g, precio_ref_q, unidad_inventario) VALUES
('Frijol negro cocido',   'leguminosas',    132.00,  8.90, 23.70,  0.50,  3.50, 'lb'),
('Arroz blanco cocido',   'cereales',       130.00,  2.70, 28.20,  0.30,  2.80, 'lb'),
('Tortilla de maíz',      'cereales',       218.00,  5.70, 45.90,  2.50,  0.15, 'unidad'),
('Incaparina preparada',  'leguminosas',     75.00,  4.10, 12.80,  1.00, 12.00, 'bolsa'),
('Plátano maduro',        'frutas',          89.00,  1.10, 23.00,  0.30,  1.20, 'lb'),
('Aceite vegetal',        'grasas_aceites', 884.00,  0.00,  0.00,100.00,  9.00, 'L'),
('Sal yodada',            'otros',            0.00,  0.00,  0.00,  0.00,  1.50, 'lb'),
('Azúcar blanca',         'cereales',       387.00,  0.00,100.00,  0.00,  2.20, 'lb'),
('Pechuga de pollo',      'carnes',         165.00, 31.00,  0.00,  3.60, 11.50, 'lb'),
('Tomate rojo',           'verduras',        18.00,  0.90,  3.90,  0.20,  2.00, 'lb'),
('Cebolla blanca',        'verduras',        40.00,  1.10,  9.30,  0.10,  2.50, 'lb'),
('Zanahoria',             'verduras',        41.00,  0.90,  9.60,  0.20,  2.00, 'lb'),
('Leche en polvo',        'lacteos',        496.00, 26.30, 38.40, 26.70, 18.00, 'lb'),
('Maíz amarillo',         'cereales',       365.00,  9.20, 74.30,  4.70,  1.80, 'lb'),
('Güisquil',              'verduras',        16.00,  0.60,  3.50,  0.10,  1.50, 'lb'),
('Ejote verde',           'verduras',        31.00,  1.80,  7.00,  0.10,  2.00, 'lb'),
('Chile pimiento',        'verduras',        26.00,  1.00,  5.00,  0.40,  3.00, 'lb'),
('Hierbabuena seca',      'otros',           70.00,  3.70, 14.90,  0.90,  4.00, 'lb');

-- Verificación
DO $$
BEGIN
    RAISE NOTICE '=== SIPAE BD creada correctamente ===';
    RAISE NOTICE 'Tablas: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE');
    RAISE NOTICE 'Vistas: %', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema='public');
END;
$$;
