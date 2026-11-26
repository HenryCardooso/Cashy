<?php
declare(strict_types=1);

function cashy_normalize_sgs_rows(array $rows, DateTimeImmutable $today): array
{
    $observations = [];
    foreach ($rows as $row) {
        if (!is_array($row) || !isset($row['data'], $row['valor']) || !is_string($row['data'])) {
            continue;
        }
        $date = DateTimeImmutable::createFromFormat('!d/m/Y', $row['data'], new DateTimeZone('America/Sao_Paulo'));
        $dateErrors = DateTimeImmutable::getLastErrors();
        $value = filter_var(str_replace(',', '.', (string)$row['valor']), FILTER_VALIDATE_FLOAT);
        if (!$date || ($dateErrors !== false && ($dateErrors['warning_count'] > 0 || $dateErrors['error_count'] > 0)) || $date > $today || $value === false || !is_finite((float)$value) || abs((float)$value) > 1000) {
            continue;
        }
        $observations[] = ['date' => $date->format('Y-m-d'), 'value' => (float)$value];
    }
    return $observations;
}
