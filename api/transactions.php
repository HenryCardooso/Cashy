<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

try {
    $userId = api_require_user();
    $pdo = api_db();

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        $statement = $pdo->prepare(
            'SELECT transaction_id, description, entry_type, category, amount, entry_date
             FROM financial_transactions WHERE user_id = ? ORDER BY entry_date DESC, transaction_id DESC'
        );
        $statement->execute([$userId]);
        $items = array_map(static function (array $row): array {
            return [
                'id' => (int)$row['transaction_id'],
                'description' => $row['description'],
                'type' => $row['entry_type'],
                'category' => $row['category'],
                'amount' => (float)$row['amount'],
                'date' => $row['entry_date'],
            ];
        }, $statement->fetchAll());
        api_json(['ok' => true, 'items' => $items]);
    }

    api_method('GET', 'POST');
    api_require_csrf();
    $input = api_input();
    $action = (string)($input['action'] ?? '');

    if ($action === 'delete') {
        $id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            api_error('invalid_id', 'Movimentação inválida.', 422);
        }
        $statement = $pdo->prepare('DELETE FROM financial_transactions WHERE transaction_id = ? AND user_id = ?');
        $statement->execute([(int)$id, $userId]);
        if ($statement->rowCount() !== 1) {
            api_error('not_found', 'Movimentação não encontrada.', 404);
        }
        api_json(['ok' => true]);
    }

    if (!in_array($action, ['create', 'update'], true)) {
        api_error('unknown_action', 'Ação não reconhecida.', 400);
    }
    $description = trim((string)($input['description'] ?? ''));
    $type = (string)($input['type'] ?? '');
    $category = trim((string)($input['category'] ?? ''));
    $amount = $input['amount'] ?? null;
    $date = (string)($input['date'] ?? '');

    if ($description === '' || mb_strlen($description, 'UTF-8') > 60) {
        api_error('invalid_description', 'A descrição deve ter entre 1 e 60 caracteres.', 422);
    }
    if (!in_array($type, ['income', 'expense'], true)) {
        api_error('invalid_type', 'Escolha entrada ou saída.', 422);
    }
    if (mb_strlen($category, 'UTF-8') > 30) {
        api_error('invalid_category', 'A categoria pode ter até 30 caracteres.', 422);
    }
    if (!is_numeric($amount) || (float)$amount <= 0 || (float)$amount > 9999999999.99) {
        api_error('invalid_amount', 'Informe um valor maior que zero.', 422);
    }
    $parsedDate = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    if (!$parsedDate || $parsedDate->format('Y-m-d') !== $date) {
        api_error('invalid_date', 'Informe uma data válida.', 422);
    }

    if ($action === 'create') {
        $statement = $pdo->prepare(
            'INSERT INTO financial_transactions (user_id, description, entry_type, category, amount, entry_date)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([$userId, $description, $type, $category, round((float)$amount, 2), $date]);
        api_json(['ok' => true, 'item' => [
            'id' => (int)$pdo->lastInsertId(),
            'description' => $description,
            'type' => $type,
            'category' => $category,
            'amount' => round((float)$amount, 2),
            'date' => $date,
        ]], 201);
    }

    $id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) {
        api_error('invalid_id', 'Movimentação inválida.', 422);
    }
    $statement = $pdo->prepare(
        'UPDATE financial_transactions
         SET description = ?, entry_type = ?, category = ?, amount = ?, entry_date = ?
         WHERE transaction_id = ? AND user_id = ?'
    );
    $statement->execute([$description, $type, $category, round((float)$amount, 2), $date, (int)$id, $userId]);
    $check = $pdo->prepare('SELECT transaction_id FROM financial_transactions WHERE transaction_id = ? AND user_id = ?');
    $check->execute([(int)$id, $userId]);
    if (!$check->fetch()) {
        api_error('not_found', 'Movimentação não encontrada.', 404);
    }
    api_json(['ok' => true, 'item' => [
        'id' => (int)$id,
        'description' => $description,
        'type' => $type,
        'category' => $category,
        'amount' => round((float)$amount, 2),
        'date' => $date,
    ]]);
} catch (Throwable $error) {
    api_db_failure($error);
}