<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class App extends BaseConfig
{
    // URL base — apunta a la raíz de tu proyecto (con el .htaccess en raíz)
    public string $baseURL = 'http://localhost/sipae/';

    // Índice de URL — vacío porque usamos .htaccess
    public string $indexPage = '';

    public string $uriProtocol = 'REQUEST_URI';

    public string $defaultLocale = 'es';
    public bool   $negotiateLocale = false;
    public string $supportedLocales = 'es';

    public string $appTimezone = 'America/Guatemala';
    public string $charset     = 'UTF-8';

    public bool $forceGlobalSecureRequests = false;

    public string $proxyIPs = '';

    public string $CSRFTokenName  = 'csrf_sipae';
    public string $CSRFHeaderName = 'X-CSRF-TOKEN';
    public string $CSRFCookieName = 'csrf_cookie_sipae';
    public int    $CSRFExpire     = 7200;
    public bool   $CSRFRegenerate = true;
    public bool   $CSRFSameSite  = true;

    // Desactivar CSRF para las llamadas AJAX del login
    public array $CSRFExcludeURIs = [
        'auth/procesar_login',
    ];

    public string $sessionDriver            = 'CodeIgniter\Session\Handlers\DatabaseHandler';
    public string $sessionCookieName        = 'sipae_session';
    public int    $sessionExpiration        = 7200;
    public string $sessionSavePath         = 'ci_sessions';
    public bool   $sessionMatchIP           = false;
    public int    $sessionTimeToUpdate      = 300;
    public bool   $sessionRegenerateDestroy = false;

    public string $cookiePrefix   = 'sipae_';
    public string $cookieDomain   = '';
    public string $cookiePath     = '/';
    public bool   $cookieSecure   = false;
    public bool   $cookieHTTPOnly = false;
    public string $cookieSameSite = 'Lax';

    public string $encryptionKey  = 'S1p4e2025GuatemalaUMG!SecretKey#XYZ';
    public string $proxyIPHeader  = 'X-Forwarded-For';
}
