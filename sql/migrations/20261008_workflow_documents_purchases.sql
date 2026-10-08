BEGIN;

ALTER TABLE alimentos
    ADD COLUMN IF NOT EXISTS precio_ref_fuente VARCHAR(200),
    ADD COLUMN IF NOT EXISTS precio_ref_fecha DATE,
    ADD COLUMN IF NOT EXISTS precio_ref_zona VARCHAR(120),
    ADD COLUMN IF NOT EXISTS tipo_compra VARCHAR(20) NOT NULL DEFAULT 'por_definir',
    ADD COLUMN IF NOT EXISTS origen_compra VARCHAR(30) NOT NULL DEFAULT 'por_definir',
    ADD COLUMN IF NOT EXISTS dias_vida_util SMALLINT;

ALTER TABLE menus_oficiales
    ADD COLUMN IF NOT EXISTS nivel_educativo VARCHAR(40),
    ADD COLUMN IF NOT EXISTS departamento VARCHAR(100),
    ADD COLUMN IF NOT EXISTS grupo_beneficiario VARCHAR(120),
    ADD COLUMN IF NOT EXISTS numero_entrega VARCHAR(80),
    ADD COLUMN IF NOT EXISTS dias_cobertura SMALLINT,
    ADD COLUMN IF NOT EXISTS monto_diario_alumno_q NUMERIC(8,2),
    ADD COLUMN IF NOT EXISTS documento_path TEXT,
    ADD COLUMN IF NOT EXISTS documento_nombre VARCHAR(255),
    ADD COLUMN IF NOT EXISTS documento_mime_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS documento_tamano_bytes BIGINT;

CREATE TABLE IF NOT EXISTS menus_escuelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus_oficiales(id) ON DELETE CASCADE,
    escuela_id UUID NOT NULL REFERENCES escuelas(id) ON DELETE CASCADE,
    distribuido_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    distribuido_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_menu_escuela UNIQUE (menu_id, escuela_id)
);
CREATE INDEX IF NOT EXISTS idx_menus_escuelas_escuela ON menus_escuelas(escuela_id, distribuido_en DESC);

CREATE TABLE IF NOT EXISTS menus_racion_items (
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
CREATE INDEX IF NOT EXISTS idx_menu_racion_opcion ON menus_racion_items(menu_id, opcion_codigo, grupo_beneficiario);

ALTER TABLE items_plan_compra
    ADD COLUMN IF NOT EXISTS frecuencia_compra VARCHAR(20) NOT NULL DEFAULT 'por_definir',
    ADD COLUMN IF NOT EXISTS fecha_compra_sugerida DATE,
    ADD COLUMN IF NOT EXISTS observacion_sugerencia TEXT;

ALTER TABLE compras_realizadas
    ADD COLUMN IF NOT EXISTS factura_nombre_original VARCHAR(255),
    ADD COLUMN IF NOT EXISTS factura_mime_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS factura_tamano_bytes BIGINT;

COMMIT;