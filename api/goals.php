<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

try {
    $userId = api_require_user();
    $pdo = api_db();

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        $statement = $pdo->prepare(
            'SELECT goal_id, name, saved_amount, target_amount
             FROM financial_goals WHERE user_id = ? ORDER BY goal_id ASC'
        );
        $statement->execute([$userId]);
        $items = array_map(static function (array $row): array {
            return [
                'id' => (int)$row['goal_id'],
                'name' => $row['name'],
                'saved' => (float)$row['saved_amount'],
                'target' => (float)$row['target_amount'],
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
            api_error('invalid_id', 'Meta inválida.', 422);
        }
        $statement = $pdo->prepare('DELETE FROM financial_goals WHERE goal_id = ? AND user_id = ?');
        $statement->execute([(int)$id, $userId]);
        if ($statement->rowCount() !== 1) {
            api_error('not_found', 'Meta não encontrada.', 404);
        }
        api_json(['ok' => true]);
    }

    if (!in_array($action, ['create', 'update'], true)) {
        api_error('unknown_action', 'Ação não reconhecida.', 400);
    }
    $name = trim((string)($input['name'] ?? ''));
    $saved = $input['saved'] ?? null;
    $target = $input['target'] ?? null;
    if ($name === '' || mb_strlen($name, 'UTF-8') > 45) {
        api_error('invalid_name', 'O nome da meta deve ter entre 1 e 45 caracteres.', 422);
    }
    if (!is_numeric($saved) || (float)$saved < 0 || !is_numeric($target) || (float)$target <= 0 ||
        (float)$saved > 9999999999.99 || (float)$target > 9999999999.99) {
        api_error('invalid_amount', 'Confira os valores da meta.', 422);
    }

    if ($action === 'create') {
        $statement = $pdo->prepare(
            'INSERT INTO financial_goals (user_id, name, saved_amount, target_amount) VALUES (?, ?, ?, ?)'
        );
        $statement->execute([$userId, $name, round((float)$saved, 2), round((float)$target, 2)]);
        api_json(['ok' => true, 'item' => [
            'id' => (int)$pdo->lastInsertId(),
            'name' => $name,
            'saved' => round((float)$saved, 2),
            'target' => round((float)$target, 2),
        ]], 201);
    }

    $id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) {
        api_error('invalid_id', 'Meta inválida.', 422);
    }
    $statement = $pdo->prepare(
        'UPDATE financial_goals SET name = ?, saved_amount = ?, target_amount = ?
         WHERE goal_id = ? AND user_id = ?'
    );
    $statement->execute([$name, round((float)$saved, 2), round((float)$target, 2), (int)$id, $userId]);
    $check = $pdo->prepare('SELECT goal_id FROM financial_goals WHERE goal_id = ? AND user_id = ?');
    $check->execute([(int)$id, $userId]);
    if (!$check->fetch()) {
        api_error('not_found', 'Meta não encontrada.', 404);
    }
    api_json(['ok' => true, 'item' => [
        'id' => (int)$id,
        'name' => $name,
        'saved' => round((float)$saved, 2),
        'target' => round((float)$target, 2),
    ]]);
} catch (Throwable $error) {
    api_db_failure($error);
}