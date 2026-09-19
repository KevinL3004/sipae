<?php

namespace App\Controllers;

use App\Models\UsuarioModel;
use CodeIgniter\Controller;

class Dashboard extends Controller
{
    protected $helpers = ['url'];

    public function index()
    {
        $data = [
            'titulo'   => 'Panel de inicio',
            'usuario'  => session()->get(),
        ];

        // Cargar estadísticas básicas para el dashboard
        $db = \Config\Database::connect();

        // Contar alertas de stock bajo (inventario con existencia <= stock_minimo)
        $alertas_stock = $db->table('inventario')
            ->where('existencia_actual <=', $db->newQuery()->select('stock_minimo')->from('inventario i2')->where('i2.id = inventario.id'))
            ->countAllResults();

        // Total de escuelas activas
        $total_escuelas = $db->table('escuelas')->where('activa', 1)->countAllResults();

        // Escuelas asignadas al técnico si el rol es tecnico_mineduc
        $rol = session()->get('rol');

        $data['stats'] = [
            'alertas_stock'  => $alertas_stock,
            'total_escuelas' => $total_escuelas,
        ];

        // Obtener inventario con alertas para la vista
        $data['inventario_alertas'] = $db->table('inventario i')
            ->select('a.nombre, i.existencia_actual, i.stock_minimo, a.unidad_inventario,
                      CASE
                        WHEN i.existencia_actual = 0 THEN "agotado"
                        WHEN i.existencia_actual <= i.stock_minimo * 0.5 THEN "critico"
                        WHEN i.existencia_actual <= i.stock_minimo THEN "bajo"
                        ELSE "normal"
                      END AS nivel')
            ->join('alimentos a', 'a.id = i.alimento_id')
            ->join('escuelas e', 'e.id = i.escuela_id')
            ->where('e.activa', 1)
            ->where('i.existencia_actual <=', $db->raw('i.stock_minimo'))
            ->limit(6)
            ->get()->getResult();

        return view('templates/header', $data)
             . view('templates/sidebar', $data)
             . view('dashboard/index', $data)
             . view('templates/footer', $data);
    }
}
