<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// ── Ruta raíz → login ────────────────────────────────────────
$routes->get('/',      'Auth::index');
$routes->get('login',  'Auth::index');
$routes->post('auth/procesar_login', 'Auth::procesar_login');
$routes->get('logout', 'Auth::logout');

// ── Dashboard ────────────────────────────────────────────────
$routes->get('dashboard', 'Dashboard::index');

// ── Módulos (se habilitan sprint a sprint) ───────────────────
// $routes->get('inventario',      'Inventario::index');
// $routes->get('menus',           'Menus::index');
// $routes->get('compras',         'Compras::index');
// $routes->get('liquidaciones',   'Liquidaciones::index');
// $routes->get('proveedores',     'Proveedores::index');
// $routes->get('usuarios',        'Usuarios::index');

// ── 404 personalizado ────────────────────────────────────────
$routes->set404Override('App\Controllers\Auth::index');
