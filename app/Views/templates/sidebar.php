<?php
$rol             = session()->get('rol');
$nombre_completo = session()->get('nombre_completo');
$iniciales       = strtoupper(mb_substr($nombre_completo, 0, 1)) .
                   strtoupper(mb_substr(strstr($nombre_completo, ' ') ?: '', 1, 1));
$seg             = service('uri')->getSegment(1);

$roles_label = [
  'tecnico_mineduc'  => 'Técnico MINEDUC',
  'director'         => 'Director',
  'docente_encargado'=> 'Docente Encargado',
  'secretaria_opf'   => 'Secretaria OPF',
  'supervisor'       => 'Supervisor',
];
?>

<aside class="sidebar">

  <div class="sidebar-header">
    <div class="sb-brand-icon">SI</div>
    <div>
      <div class="sb-brand-name">SIPAE</div>
      <div class="sb-brand-sub">Programa Alimentario</div>
    </div>
  </div>

  <nav style="flex:1">

    <div class="sidebar-section">
      <div class="sidebar-section-label">Principal</div>
      <a href="<?= base_url('dashboard') ?>"
         class="nav-link-sp <?= $seg === 'dashboard' ? 'active' : '' ?>">
        <i class="bi bi-grid-1x2-fill"></i> Panel de inicio
      </a>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Gestión</div>

      <?php if (in_array($rol, ['tecnico_mineduc','director','docente_encargado','secretaria_opf','supervisor'])): ?>
      <a href="<?= base_url('menus') ?>"
         class="nav-link-sp <?= $seg === 'menus' ? 'active' : '' ?>">
        <i class="bi bi-calendar3-week-fill"></i> Menú oficial
      </a>
      <?php endif; ?>

      <?php if (in_array($rol, ['director','docente_encargado','secretaria_opf'])): ?>
      <a href="<?= base_url('inventario') ?>"
         class="nav-link-sp <?= $seg === 'inventario' ? 'active' : '' ?>">
        <i class="bi bi-box-seam-fill"></i> Inventario
      </a>
      <a href="<?= base_url('compras') ?>"
         class="nav-link-sp <?= $seg === 'compras' ? 'active' : '' ?>">
        <i class="bi bi-cart-fill"></i> Plan de compras
      </a>
      <?php endif; ?>

      <?php if (in_array($rol, ['director','secretaria_opf','tecnico_mineduc'])): ?>
      <a href="<?= base_url('liquidaciones') ?>"
         class="nav-link-sp <?= $seg === 'liquidaciones' ? 'active' : '' ?>">
        <i class="bi bi-file-earmark-check-fill"></i> Liquidaciones
      </a>
      <?php endif; ?>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Catálogos</div>
      <a href="<?= base_url('proveedores') ?>"
         class="nav-link-sp <?= $seg === 'proveedores' ? 'active' : '' ?>">
        <i class="bi bi-truck"></i> Proveedores
      </a>
      <?php if (in_array($rol, ['tecnico_mineduc','director'])): ?>
      <a href="<?= base_url('usuarios') ?>"
         class="nav-link-sp <?= $seg === 'usuarios' ? 'active' : '' ?>">
        <i class="bi bi-people-fill"></i> Usuarios
      </a>
      <?php endif; ?>
    </div>

  </nav>

  <div class="sidebar-footer">
    <div class="user-info-sb">
      <div class="user-avatar"><?= esc($iniciales) ?></div>
      <div>
        <div class="user-name-sb"><?= esc($nombre_completo) ?></div>
        <div class="user-role-sb"><?= esc($roles_label[$rol] ?? $rol) ?></div>
      </div>
    </div>
    <a href="<?= base_url('logout') ?>" class="btn-logout"
       onclick="return confirm('¿Deseas cerrar sesión?')">
      <i class="bi bi-box-arrow-left"></i> Cerrar sesión
    </a>
  </div>

</aside>

<div class="main-content">
  <div class="topbar">
    <span class="topbar-title"><?= esc($titulo ?? 'SIPAE') ?></span>
    <span style="font-size:12px;color:var(--muted)">
      Ciclo 2025 &nbsp;|&nbsp; <?= date('d/m/Y') ?>
      &nbsp;|&nbsp; <?= esc(session()->get('username')) ?>
    </span>
  </div>
  <div class="page-content">
