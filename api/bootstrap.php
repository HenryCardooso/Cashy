<?php
declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && $_SERVER['HTTPS'] !== 'off';
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.gc_maxlifetime', '2592000');
session_name('CASHYSESSID');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $https,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function api_json(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function api_error(string $code, string $message, int $status): never
{
    api_json(['ok' => false, 'error' => $code, 'message' => $message], $status);
}

function api_method(string ...$allowed): void
{
    $method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        api_error('method_not_allowed', 'Método não permitido.', 405);
    }
}

function api_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $value = json_decode($raw, true);
    if (!is_array($value)) {
        api_error('invalid_json', 'Os dados enviados não estão em um formato válido.', 400);
    }
    return $value;
}

function api_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $configPath = __DIR__ . '/config.php';
    if (!is_file($configPath)) {
        throw new RuntimeException('Configure api/config.php a partir de api/config.example.php.');
    }
    $config = require $configPath;
    if (!is_array($config)) {
        throw new RuntimeException('A configuração do banco está inválida.');
    }

    $host = (string)($config['host'] ?? '127.0.0.1');
    $port = (int)($config['port'] ?? 3306);
    $database = (string)($config['database'] ?? 'cashy');
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $database)) {
        throw new RuntimeException('O nome do banco contém caracteres inválidos.');
    }

    $dsn = 'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $database . ';charset=utf8mb4';
    $pdo = new PDO($dsn, (string)($config['username'] ?? ''), (string)($config['password'] ?? ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function api_require_user(): int
{
    $userId = filter_var($_SESSION['user_id'] ?? null, FILTER_VALIDATE_INT);
    if (!$userId || $userId < 1) {
        api_error('unauthorized', 'Entre na sua conta para continuar.', 401);
    }
    return (int)$userId;
}

function api_csrf_token(): string
{
    if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function api_require_csrf(): void
{
    $expected = (string)($_SESSION['csrf_token'] ?? '');
    $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if ($expected === '' || $provided === '' || !hash_equals($expected, $provided)) {
        api_error('csrf_failed', 'Atualize a página e tente novamente.', 419);
    }
}

function api_login_user(int $userId, string $name, string $email, bool $remember): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_email'] = $email;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

    $cookie = session_get_cookie_params();
    setcookie(session_name(), session_id(), [
        'expires' => $remember ? time() + 2592000 : 0,
        'path' => $cookie['path'] ?: '/',
        'domain' => $cookie['domain'],
        'secure' => (bool)$cookie['secure'],
        'httponly' => true,
        'samesite' => $cookie['samesite'] ?: 'Lax',
    ]);
}

function api_clear_session(): void
{
    $cookie = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $cookie['path'] ?: '/',
        'domain' => $cookie['domain'],
        'secure' => (bool)$cookie['secure'],
        'httponly' => true,
        'samesite' => $cookie['samesite'] ?: 'Lax',
    ]);
    $_SESSION = [];
    session_destroy();
}

function api_db_failure(Throwable $error): never
{
    error_log('[Cashy] ' . $error->getMessage());
    api_error('server_error', 'Não foi possível concluir a operação. Confira a conexão PHP com o MySQL.', 500);
}