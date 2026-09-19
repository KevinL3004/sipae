<?php

namespace App\Models;

use CodeIgniter\Model;

class UsuarioModel extends Model
{
    protected $table      = 'usuarios';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false; // usamos UUID

    protected $returnType = 'object';
    protected $useSoftDeletes = false;

    protected $allowedFields = [
        'id', 'username', 'password_hash', 'nombre_completo',
        'correo', 'rol', 'activo', 'ultimo_acceso',
        'refresh_token_hash', 'creado_en', 'actualizado_en',
    ];

    protected $useTimestamps  = false; // los manejamos manual

    protected $validationRules    = [];
    protected $validationMessages = [];
    protected $skipValidation     = false;

    // ── Login ──────────────────────────────────────────────────
    /**
     * Verifica credenciales y devuelve el objeto usuario o false.
     */
    public function login(string $username, string $password)
    {
        $usuario = $this->where('username', $username)
                        ->where('activo', 1)
                        ->first();

        if (! $usuario) {
            return false;
        }

        // Verificar contraseña con password_verify (hash bcrypt)
        if (! password_verify($password, $usuario->password_hash)) {
            return false;
        }

        // Actualizar último acceso
        $this->where('id', $usuario->id)
             ->set(['ultimo_acceso' => date('Y-m-d H:i:s')])
             ->update();

        return $usuario;
    }

    // ── CRUD ───────────────────────────────────────────────────
    public function crearUsuario(array $data): string
    {
        $data['id']            = $this->generarUUID();
        $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        $data['creado_en']     = date('Y-m-d H:i:s');
        $data['actualizado_en']= date('Y-m-d H:i:s');
        $data['activo']        = 1;
        unset($data['password']);

        $this->insert($data);
        return $data['id'];
    }

    public function actualizarUsuario(string $id, array $data): bool
    {
        if (! empty($data['password'])) {
            $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        unset($data['password']);
        $data['actualizado_en'] = date('Y-m-d H:i:s');

        return $this->where('id', $id)->set($data)->update();
    }

    public function desactivar(string $id): bool
    {
        return $this->where('id', $id)->set(['activo' => 0])->update();
    }

    public function getTodos(): array
    {
        return $this->where('activo', 1)
                    ->orderBy('nombre_completo', 'ASC')
                    ->findAll();
    }

    // ── UUID ───────────────────────────────────────────────────
    private function generarUUID(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
