<?php
declare(strict_types=1);

$path = rawurldecode((string)(parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/'));
$page = basename($path);
$protectedPages = [
    'biblioteca.html', 'calculadoras.html', 'curso.html', 'dashboard.html',
    'diagnostico.html', 'educacao.html', 'metas.html', 'movimentacoes.html',
    'perfil.html', 'planejamento.html', 'praticar.html', 'relatorios.html',
    'reserva.html', 'simulador.html',
];

if (in_array($page, $protectedPages, true)) {
    $_GET['path'] = $page;
    require __DIR__ . '/api/page-router.php';
}

return false;
