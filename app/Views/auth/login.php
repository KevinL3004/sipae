<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIPAE — Ingresar</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <link href="<?= base_url('assets/css/sipae.css') ?>" rel="stylesheet">
</head>
<body>

<div class="login-wrap">
  <div class="login-card">

    <div class="login-logo">
      <div class="logo-badge">SI</div>
      <h1>Sistema de Gestión Alimentaria Escolar</h1>
      <p>Universidad Mariano Gálvez de Guatemala</p>
    </div>

    <form id="form-login" autocomplete="off">

      <div class="mb-3">
        <label class="form-label-sipae">Usuario</label>
        <div class="input-group">
          <span class="input-group-text input-group-icon">
            <i class="bi bi-person"></i>
          </span>
          <input type="text" class="input-sipae" id="username"
                 name="username" placeholder="Tu nombre de usuario" autofocus>
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label-sipae">Contraseña</label>
        <div class="input-group">
          <span class="input-group-text input-group-icon">
            <i class="bi bi-lock"></i>
          </span>
          <input type="password" class="input-sipae" id="password"
                 name="password" placeholder="Tu contraseña">
          <button type="button" class="input-group-text input-toggle" id="toggle-pass">
            <i class="bi bi-eye" id="ico-ojo"></i>
          </button>
        </div>
      </div>

      <button type="submit" class="btn-sipae" id="btn-login">
        <span id="btn-texto">Ingresar al sistema</span>
        <span id="btn-spinner" class="d-none">
          <span class="spinner-sipae me-2"></span> Verificando...
        </span>
      </button>

    </form>

    <p class="text-center mt-4" style="font-size:11px;color:var(--muted)">
      &copy; 2025 SIPAE &nbsp;·&nbsp; UMG Guatemala
    </p>

  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
const BASE = '<?= base_url() ?>';

// Toggle contraseña
document.getElementById('toggle-pass').addEventListener('click', function () {
  const inp = document.getElementById('password');
  const ico = document.getElementById('ico-ojo');
  if (inp.type === 'password') {
    inp.type = 'text';
    ico.className = 'bi bi-eye-slash';
  } else {
    inp.type = 'password';
    ico.className = 'bi bi-eye';
  }
});

// Submit AJAX
document.getElementById('form-login').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Ingresa tu usuario y contraseña.',
      background: '#161b22',
      color: '#e6edf3',
      confirmButtonColor: '#00BCD4',
    });
    return;
  }

  // Mostrar spinner
  document.getElementById('btn-texto').classList.add('d-none');
  document.getElementById('btn-spinner').classList.remove('d-none');
  document.getElementById('btn-login').disabled = true;

  const fd = new FormData();
  fd.append('username', username);
  fd.append('password', password);

  fetch(BASE + 'auth/procesar_login', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: data.mensaje,
          background: '#161b22',
          color: '#e6edf3',
          confirmButtonColor: '#00BCD4',
          timer: 1400,
          showConfirmButton: false,
        }).then(() => { window.location.href = data.redirect; });
      } else {
        document.getElementById('btn-texto').classList.remove('d-none');
        document.getElementById('btn-spinner').classList.add('d-none');
        document.getElementById('btn-login').disabled = false;
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: data.mensaje,
          background: '#161b22',
          color: '#e6edf3',
          confirmButtonColor: '#00BCD4',
        });
      }
    })
    .catch(() => {
      document.getElementById('btn-texto').classList.remove('d-none');
      document.getElementById('btn-spinner').classList.add('d-none');
      document.getElementById('btn-login').disabled = false;
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor. Verifica que XAMPP está activo.',
        background: '#161b22',
        color: '#e6edf3',
        confirmButtonColor: '#00BCD4',
      });
    });
});
</script>
</body>
</html>
