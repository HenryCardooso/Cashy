<?php
declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');
require_once __DIR__ . '/indicator-utils.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=900, stale-if-error=3600');
header('X-Content-Type-Options: nosniff');
if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método não permitido.']);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'message' => 'A consulta de indicadores não está disponível no servidor.']);
    exit;
}

// Séries oficiais SGS: meta Selic (432) e IPCA mensal (433).
$series = [
    'selic' => ['name' => 'Meta Selic', 'code' => 432, 'unit' => '% ao ano', 'count' => 12],
    'ipca' => ['name' => 'IPCA', 'code' => 433, 'unit' => '% no mês', 'count' => 13],
];
$today = new DateTimeImmutable('today', new DateTimeZone('America/Sao_Paulo'));
$data = [];
$errors = [];

foreach ($series as $key => $definition) {
    $url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.' . $definition['code'] . '/dados/ultimos/' . $definition['count'] . '?formato=json';
    $handle = curl_init($url);
    curl_setopt_array($handle, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
        CURLOPT_USERAGENT => 'Cashy-EducacaoFinanceira/1.0',
    ]);
    $body = curl_exec($handle);
    $status = (int)curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
    $curlError = curl_errno($handle);
    curl_close($handle);

    $rows = is_string($body) && $status >= 200 && $status < 300 && $curlError === 0
        ? json_decode($body, true)
        : null;
    if (!is_array($rows)) {
        $errors[$key] = 'A fonte não respondeu com dados válidos.';
        continue;
    }

    $observations = cashy_normalize_sgs_rows($rows, $today);
    if (!$observations) {
        $errors[$key] = 'Ainda não há observações válidas disponíveis.';
        continue;
    }
    $data[$key] = $definition + ['observations' => $observations];
}

if (!$data) {
    http_response_code(503);
}
echo json_encode([
    'ok' => (bool)$data,
    'source' => 'Banco Central do Brasil · Sistema Gerenciador de Séries Temporais (SGS)',
    'checked_at' => (new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo')))->format(DATE_ATOM),
    'data' => $data,
    'errors' => $errors,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
