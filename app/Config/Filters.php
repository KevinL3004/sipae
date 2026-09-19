<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Filters extends BaseConfig
{
    // Filtros disponibles
    public array $aliases = [
        'csrf'      => \CodeIgniter\Filters\CSRF::class,
        'toolbar'   => \CodeIgniter\Filters\DebugToolbar::class,
        'honeypot'  => \CodeIgniter\Filters\Honeypot::class,
        'invalidchars' => \CodeIgniter\Filters\InvalidChars::class,
        'secureheaders' => \CodeIgniter\Filters\SecureHeaders::class,
        'auth'      => \App\Filters\AuthFilter::class,
    ];

    public array $required = [
        'before' => [],
        'after'  => [
            'toolbar',
        ],
    ];

    // Aplicar filtro de autenticación a rutas protegidas
    public array $filters = [
        'auth' => [
            'before' => [
                'dashboard',
                'dashboard/*',
                'inventario',
                'inventario/*',
                'menus',
                'menus/*',
                'compras',
                'compras/*',
                'liquidaciones',
                'liquidaciones/*',
                'proveedores',
                'proveedores/*',
                'usuarios',
                'usuarios/*',
            ],
        ],
    ];
}
