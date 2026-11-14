<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

try {
    api_method('POST');
    api_require_csrf();
    $userId = api_require_user();
    $input = api_input();
    $password = (string)($input['password'] ?? '');
    $pdo = api_db();
    $verify = $pdo->prepare('SELECT password_hash FROM users WHERE user_id = ?');
    $verify->execute([$userId]);
    if (!password_verify($password, (string)$verify->fetchColumn())) api_error('current_password', 'A senha não confere. A conta não foi excluída.', 422);
    $statement = $pdo->prepare('DELETE FROM users WHERE user_id = ?');
    $statement->execute([$userId]);
    api_clear_session();
    api_json(['ok' => true]);
} catch (Throwable $error) {
    api_db_failure($error);
}
