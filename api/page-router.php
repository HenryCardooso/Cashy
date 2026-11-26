<?php
declare(strict_types=1);

$protectedPages = [
    'biblioteca.html', 'calculadoras.html', 'curso.html', 'dashboard.html',
    'diagnostico.html', 'educacao.html', 'metas.html', 'movimentacoes.html',
    'perfil.html', 'planejamento.html', 'praticar.html', 'relatorios.html',
    'reserva.html', 'simulador.html',
];
$page = basename((string)($_GET['path'] ?? ''));
if (!in_array($page, $protectedPages, true)) {
    http_response_code(404);
    exit('Página não encontrada.');
}

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if (!in_array($method, ['GET', 'HEAD'], true)) {
    header('Allow: GET, HEAD');
    http_response_code(405);
    exit('Método não permitido.');
}

require __DIR__ . '/bootstrap.php';
$userId = filter_var($_SESSION['user_id'] ?? null, FILTER_VALIDATE_INT);
$originalPath = (string)(parse_url((string)($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH) ?: '');
if (basename($originalPath) !== $page) {
    $originalPath = '/' . $page;
}
$basePath = rtrim(str_replace('\\', '/', dirname($originalPath)), '/');
$loginPath = ($basePath === '' ? '' : $basePath) . '/login.html';
$destination = $originalPath;
$originalQuery = (string)(parse_url((string)($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_QUERY) ?: '');
if ($originalQuery !== '') {
    $destination .= '?' . $originalQuery;
}

function page_gate_redirect(string $loginPath, string $destination, string $notice): never
{
    $query = http_build_query(['destino' => $destination, 'aviso' => $notice]);
    header('Cache-Control: no-store');
    header('Location: ' . $loginPath . '?' . $query, true, 302);
    exit;
}

if (!$userId || $userId < 1) {
    page_gate_redirect($loginPath, $destination, 'login');
}

try {
    $statement = api_db()->prepare('SELECT user_id FROM users WHERE user_id = ?');
    $statement->execute([(int)$userId]);
    if (!$statement->fetch()) {
        api_clear_session();
        page_gate_redirect($loginPath, $destination, 'login');
    }
} catch (Throwable $error) {
    http_response_code(503);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Cashy indisponível</title><body><h1>Não foi possível confirmar sua conta agora.</h1><p>Tente novamente em instantes.</p><a href="' . htmlspecialchars($loginPath, ENT_QUOTES, 'UTF-8') . '">Voltar ao login</a></body></html>';
    exit;
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
if ($method !== 'HEAD') {
    readfile(dirname(__DIR__) . DIRECTORY_SEPARATOR . $page);
}
exit;
