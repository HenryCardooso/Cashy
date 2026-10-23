<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

try {
    api_method('POST');
    api_require_csrf();
    $userId = api_require_user();
    $statement = api_db()->prepare('DELETE FROM users WHERE user_id = ?');
    $statement->execute([$userId]);
    api_clear_session();
    api_json(['ok' => true]);
} catch (Throwable $error) {
    api_db_failure($error);
}