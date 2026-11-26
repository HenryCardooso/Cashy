<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/indicator-utils.php';
$today = new DateTimeImmutable('2026-11-25', new DateTimeZone('America/Sao_Paulo'));
$rows = [
    ['data' => '24/11/2026', 'valor' => '13.75'],
    ['data' => '25/11/2026', 'valor' => '-0,32'],
    ['data' => '26/11/2026', 'valor' => '99'],
    ['data' => '31/02/2026', 'valor' => '1.2'],
    ['data' => '20/11/2026', 'valor' => 'not-a-number'],
    ['data' => '20/11/2026', 'valor' => '1001'],
    ['data' => '20/11/2026'],
    'invalid-row',
];
$actual = cashy_normalize_sgs_rows($rows, $today);
$expected = [
    ['date' => '2026-11-24', 'value' => 13.75],
    ['date' => '2026-11-25', 'value' => -0.32],
];
if ($actual !== $expected) {
    throw new RuntimeException('SGS normalization rejected/accepted unexpected rows.');
}
fwrite(STDOUT, "OK: SGS row validation rejects invalid and future observations.\n");
