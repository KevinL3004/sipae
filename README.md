# SIPAE — Instalación sobre CodeIgniter 4

## Pasos para instalar

### 1. Descargar CodeIgniter 4
Ve a https://codeigniter.com/download y descarga la versión 4.5.x
Descomprime y renombra la carpeta como `sipae`
Colócala en: /Applications/XAMPP/htdocs/sipae/

### 2. Copiar los archivos de este ZIP
Copia el contenido de esta carpeta DENTRO de tu carpeta sipae.
Los archivos se mezclan con los de CI4. Cuando pregunte si reemplazar, di SÍ.

Archivos que se copian/reemplazan:
- .htaccess                    (raíz)
- app/Config/App.php
- app/Config/Database.php
- app/Config/Routes.php
- app/Config/Filters.php
- app/Filters/AuthFilter.php   (carpeta nueva)
- app/Controllers/Auth.php
- app/Controllers/Dashboard.php
- app/Models/UsuarioModel.php
- app/Views/auth/login.php
- app/Views/dashboard/index.php
- app/Views/templates/header.php
- app/Views/templates/sidebar.php
- app/Views/templates/footer.php
- public/assets/css/sipae.css
- public/assets/js/sipae.js

### 3. Crear tabla de sesiones en MySQL
Ejecuta esto en MySQL Workbench sobre sipae_db:

CREATE TABLE IF NOT EXISTS `ci_sessions` (
    `id`         VARCHAR(128) NOT NULL,
    `ip_address` VARCHAR(45)  NOT NULL,
    `timestamp`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `data`       BLOB         NOT NULL,
    PRIMARY KEY (`id`),
    KEY `ci_sessions_timestamp` (`timestamp`)
);

### 4. Insertar usuario de prueba
Ejecuta el archivo usuario_prueba.sql en MySQL Workbench.

### 5. Verificar que .htaccess funciona
Asegúrate de que mod_rewrite está activo en XAMPP.
En XAMPP → Apache → httpd.conf busca:
  LoadModule rewrite_module modules/mod_rewrite.so
Que NO tenga # al inicio.

### 6. Abrir en el navegador
http://localhost/sipae/

## Credenciales de prueba
| Usuario        | Contraseña  | Rol              |
|----------------|-------------|------------------|
| admin_sipae    | Admin2025!  | Técnico MINEDUC  |
| director147    | Admin2025!  | Director         |
| secretaria_opf | Admin2025!  | Secretaria OPF   |
