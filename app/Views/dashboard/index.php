<?php
$rol = session()->get('rol');
?>

<!-- Alertas de stock crítico -->
<?php if (!empty($inventario_alertas)): ?>
<div class="alert-sp alert-danger mb-4">
  <i class="bi bi-exclamation-triangle-fill" style="font-size:16px;margin-top:2px"></i>
  <div>
    <strong>Atención:</strong>
    <?= count($inventario_alertas) ?> producto(s) con stock bajo o crítico en bodega.
    <a href="<?= base_url('inventario') ?>" style="color:var(--danger);text-decoration:underline">
      Ver inventario
    </a>
  </div>
</div>
<?php endif; ?>

<!-- KPIs -->
<div class="kpi-grid">
  <div class="kpi-card">
    <div class="kpi-label">Escuelas activas</div>
    <div class="kpi-value"><?= $stats['total_escuelas'] ?? 0 ?></div>
    <div class="kpi-detail">En el sistema</div>
  </div>
  <div class="kpi-card kpi-warning">
    <div class="kpi-label">Alertas de stock</div>
    <div class="kpi-value"><?= $stats['alertas_stock'] ?? 0 ?></div>
    <div class="kpi-detail">Productos por agotarse</div>
  </div>
  <div class="kpi-card kpi-success">
    <div class="kpi-label">Ciclo escolar</div>
    <div class="kpi-value">2025</div>
    <div class="kpi-detail">En curso</div>
  </div>
  <div class="kpi-card kpi-danger">
    <div class="kpi-label">Liquidaciones</div>
    <div class="kpi-value">—</div>
    <div class="kpi-detail">Pendientes del período</div>
  </div>
</div>

<!-- Contenido principal -->
<div class="grid-2">

  <!-- Inventario con alertas -->
  <div class="card-sp">
    <div class="card-sp-title">
      Niveles de inventario críticos
      <a href="<?= base_url('inventario') ?>" class="btn-outline-sipae" style="font-size:11px">
        Ver todo
      </a>
    </div>
    <?php if (!empty($inventario_alertas)): ?>
      <?php foreach ($inventario_alertas as $item):
        $pct = $item->stock_minimo > 0
          ? min(100, round(($item->existencia_actual / $item->stock_minimo) * 100))
          : 0;
        $color = $item->nivel === 'agotado' ? 'var(--danger)'
               : ($item->nivel === 'critico' ? 'var(--danger)'
               : ($item->nivel === 'bajo'    ? 'var(--warning)'
               : 'var(--success)'));
      ?>
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px">
          <span style="font-size:12px;font-weight:600"><?= esc($item->nombre) ?></span>
          <span class="badge-sp badge-<?= esc($item->nivel) ?>"><?= esc($item->nivel) ?></span>
        </div>
        <div class="nivel-wrap">
          <div class="nivel-bar">
            <div class="nivel-fill" style="width:<?= $pct ?>%;background:<?= $color ?>"></div>
          </div>
          <div class="nivel-num"><?= $pct ?>%</div>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-top:3px">
          <?= $item->existencia_actual ?> / <?= $item->stock_minimo ?> <?= esc($item->unidad_inventario) ?>
        </div>
      </div>
      <?php endforeach; ?>
    <?php else: ?>
      <div class="alert-sp alert-success">
        <i class="bi bi-check-circle-fill"></i>
        <span>Todos los niveles de inventario están normales.</span>
      </div>
    <?php endif; ?>
  </div>

  <!-- Accesos rápidos -->
  <div class="card-sp">
    <div class="card-sp-title">Accesos rápidos</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

      <?php if (in_array($rol, ['tecnico_mineduc','director','docente_encargado','secretaria_opf'])): ?>
      <a href="<?= base_url('menus') ?>" style="
        background:var(--surface-2);border:1px solid var(--border);border-radius:10px;
        padding:18px 16px;text-align:center;text-decoration:none;color:var(--text);
        transition:border-color .15s,background .15s;display:block"
        onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-lite)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--surface-2)'">
        <i class="bi bi-calendar3-week-fill" style="font-size:24px;color:var(--accent);display:block;margin-bottom:8px"></i>
        <span style="font-size:12px;font-weight:600">Menú oficial</span>
      </a>
      <?php endif; ?>

      <?php if (in_array($rol, ['director','docente_encargado','secretaria_opf'])): ?>
      <a href="<?= base_url('inventario') ?>" style="
        background:var(--surface-2);border:1px solid var(--border);border-radius:10px;
        padding:18px 16px;text-align:center;text-decoration:none;color:var(--text);
        transition:border-color .15s,background .15s;display:block"
        onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-lite)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--surface-2)'">
        <i class="bi bi-box-seam-fill" style="font-size:24px;color:var(--accent);display:block;margin-bottom:8px"></i>
        <span style="font-size:12px;font-weight:600">Inventario</span>
      </a>

      <a href="<?= base_url('compras') ?>" style="
        background:var(--surface-2);border:1px solid var(--border);border-radius:10px;
        padding:18px 16px;text-align:center;text-decoration:none;color:var(--text);
        transition:border-color .15s,background .15s;display:block"
        onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-lite)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--surface-2)'">
        <i class="bi bi-cart-fill" style="font-size:24px;color:var(--accent);display:block;margin-bottom:8px"></i>
        <span style="font-size:12px;font-weight:600">Plan de compras</span>
      </a>
      <?php endif; ?>

      <?php if (in_array($rol, ['director','secretaria_opf','tecnico_mineduc'])): ?>
      <a href="<?= base_url('liquidaciones') ?>" style="
        background:var(--surface-2);border:1px solid var(--border);border-radius:10px;
        padding:18px 16px;text-align:center;text-decoration:none;color:var(--text);
        transition:border-color .15s,background .15s;display:block"
        onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-lite)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--surface-2)'">
        <i class="bi bi-file-earmark-check-fill" style="font-size:24px;color:var(--accent);display:block;margin-bottom:8px"></i>
        <span style="font-size:12px;font-weight:600">Liquidaciones</span>
      </a>
      <?php endif; ?>

    </div>
  </div>

</div>

<!-- Info del sistema -->
<div class="card-sp">
  <div class="card-sp-title">Información del sistema</div>
  <div style="display:flex;gap:32px;flex-wrap:wrap">
    <div><span style="color:var(--muted);font-size:12px">Usuario activo:</span>
         <strong style="margin-left:8px"><?= esc(session()->get('nombre_completo')) ?></strong></div>
    <div><span style="color:var(--muted);font-size:12px">Rol:</span>
         <strong style="margin-left:8px"><?= esc(session()->get('rol')) ?></strong></div>
    <div><span style="color:var(--muted);font-size:12px">Versión:</span>
         <strong style="margin-left:8px">SIPAE v1.0 — CodeIgniter 4</strong></div>
    <div><span style="color:var(--muted);font-size:12px">Fecha:</span>
         <strong style="margin-left:8px"><?= date('d/m/Y H:i') ?></strong></div>
  </div>
</div>
