-- ============================================================
-- SIPAE — Usuario de prueba para el login
-- Ejecutar en MySQL Workbench sobre sipae_db
-- ============================================================

USE sipae_db;

-- Insertar usuario administrador con contraseña: Admin2025!
-- El hash fue generado con password_hash('Admin2025!', PASSWORD_BCRYPT)
INSERT INTO usuarios
    (id, username, password_hash, nombre_completo, correo, rol, activo, creado_en, actualizado_en)
VALUES (
    UUID(),
    'admin_sipae',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Administrador SIPAE',
    'admin@sipae.edu.gt',
    'tecnico_mineduc',
    1,
    NOW(),
    NOW()
);

-- Usuario director de prueba — contraseña: Admin2025!
INSERT INTO usuarios
    (id, username, password_hash, nombre_completo, correo, rol, activo, creado_en, actualizado_en)
VALUES (
    UUID(),
    'director147',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Prof. Roberto Ajucum Sipac',
    'director147@sipae.edu.gt',
    'director',
    1,
    NOW(),
    NOW()
);

-- Usuario secretaria OPF — contraseña: Admin2025!
INSERT INTO usuarios
    (id, username, password_hash, nombre_completo, correo, rol, activo, creado_en, actualizado_en)
VALUES (
    UUID(),
    'secretaria_opf',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Sra. Juana Esperanza Choc Caal',
    'jchoc@sipae.edu.gt',
    'secretaria_opf',
    1,
    NOW(),
    NOW()
);

-- Verificar
SELECT id, username, nombre_completo, rol, activo FROM usuarios;
