<?php

namespace App\Controllers;

use App\Models\UsuarioModel;
use CodeIgniter\Controller;

class Auth extends Controller
{
    protected $helpers = ['url', 'form'];

    // ── GET /login ─────────────────────────────────────────────
    public function index()
    {
        // Si ya tiene sesión activa, ir al dashboard
        if (session()->get('logged_in')) {
            return redirect()->to(base_url('dashboard'));
        }

        return view('auth/login');
    }

    // ── POST /auth/procesar_login ──────────────────────────────
    public function procesar_login()
    {
        helper('url');

        $username = trim($this->request->getPost('username'));
        $password = $this->request->getPost('password');

        // Respuesta JSON para el fetch del frontend
        $this->response->setContentType('application/json');

        if (empty($username) || empty($password)) {
            return $this->response->setJSON([
                'ok'      => false,
                'mensaje' => 'El usuario y la contraseña son obligatorios.',
            ]);
        }

        $model   = new UsuarioModel();
        $usuario = $model->login($username, $password);

        if ($usuario) {
            // Guardar sesión
            session()->set([
                'usuario_id'      => $usuario->id,
                'username'        => $usuario->username,
                'nombre_completo' => $usuario->nombre_completo,
                'rol'             => $usuario->rol,
                'logged_in'       => true,
            ]);

            return $this->response->setJSON([
                'ok'       => true,
                'mensaje'  => '¡Bienvenido, ' . $usuario->nombre_completo . '!',
                'redirect' => base_url('dashboard'),
            ]);
        }

        return $this->response->setJSON([
            'ok'      => false,
            'mensaje' => 'Credenciales incorrectas. Verifica tu usuario y contraseña.',
        ]);
    }

    // ── GET /logout ────────────────────────────────────────────
    public function logout()
    {
        session()->destroy();
        return redirect()->to(base_url('login'));
    }
}
