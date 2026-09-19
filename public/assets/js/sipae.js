/* SIPAE — JS global */

// Configuración global de SweetAlert2 con tema oscuro
const SwalSipae = Swal.mixin({
  background:          '#161b22',
  color:               '#e6edf3',
  confirmButtonColor:  '#00BCD4',
  cancelButtonColor:   '#30363d',
});

// Confirmar acción destructiva
function confirmarAccion(mensaje, callback) {
  SwalSipae.fire({
    icon:              'warning',
    title:             '¿Estás seguro?',
    text:              mensaje,
    showCancelButton:  true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText:  'Cancelar',
  }).then(result => {
    if (result.isConfirmed) callback();
  });
}

// Toast de éxito
function toastOk(mensaje) {
  SwalSipae.fire({
    icon:  'success',
    title: mensaje,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
  });
}

// Toast de error
function toastError(mensaje) {
  SwalSipae.fire({
    icon:  'error',
    title: mensaje,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
  });
}
