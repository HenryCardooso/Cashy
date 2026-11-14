<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$avatarKeys = ['leaf', 'sun', 'spark', 'moon', 'flower', 'wave'];
$avatarColors = ['green', 'blue', 'violet', 'amber', 'rose'];
$defaultPreferences = ['learning_reminder' => true];

try {
    $userId = api_require_user();
    $pdo = api_db();
    $ensure = $pdo->prepare('INSERT IGNORE INTO user_profiles (user_id, avatar_key, avatar_color, notification_preferences) VALUES (?, ?, ?, ?)');
    $ensure->execute([$userId, 'leaf', 'green', json_encode($defaultPreferences, JSON_THROW_ON_ERROR)]);

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        $query = $pdo->prepare('SELECT u.full_name, u.email, u.created_at, p.avatar_key, p.avatar_color, p.notification_preferences,
            (SELECT COUNT(*) FROM course_progress cp WHERE cp.user_id = u.user_id) AS completed_courses,
            (SELECT COUNT(*) FROM education_activity ea WHERE ea.user_id = u.user_id AND ea.event_type = \'topic_completed\') AS completed_topics,
            (SELECT COALESCE(SUM(points), 0) FROM education_activity ea WHERE ea.user_id = u.user_id) AS xp
            FROM users u JOIN user_profiles p ON p.user_id = u.user_id WHERE u.user_id = ?');
        $query->execute([$userId]);
        $row = $query->fetch();
        $preferences = json_decode((string)$row['notification_preferences'], true);
        api_json(['ok' => true, 'profile' => [
            'name' => $row['full_name'], 'email' => $row['email'], 'created_at' => $row['created_at'],
            'avatar_key' => $row['avatar_key'], 'avatar_color' => $row['avatar_color'],
            'preferences' => is_array($preferences) ? $preferences : $defaultPreferences,
            'completed_courses' => (int)$row['completed_courses'], 'completed_topics' => (int)$row['completed_topics'], 'xp' => (int)$row['xp'],
        ]]);
    }

    api_method('POST');
    api_require_csrf();
    $input = api_input();
    $action = (string)($input['action'] ?? '');

    if ($action === 'update') {
        $name = trim((string)($input['name'] ?? ''));
        $avatarKey = (string)($input['avatar_key'] ?? 'leaf');
        $avatarColor = (string)($input['avatar_color'] ?? 'green');
        $preferences = $input['preferences'] ?? [];
        if (mb_strlen($name, 'UTF-8') < 2 || mb_strlen($name, 'UTF-8') > 80) api_error('invalid_name', 'Informe um nome entre 2 e 80 caracteres.', 422);
        if (!in_array($avatarKey, $avatarKeys, true) || !in_array($avatarColor, $avatarColors, true)) api_error('invalid_avatar', 'Escolha um avatar disponível.', 422);
        if (!is_array($preferences) || !is_bool($preferences['learning_reminder'] ?? null)) api_error('invalid_preferences', 'Confira suas preferências.', 422);
        $pdo->beginTransaction();
        $pdo->prepare('UPDATE users SET full_name = ? WHERE user_id = ?')->execute([$name, $userId]);
        $pdo->prepare('UPDATE user_profiles SET avatar_key = ?, avatar_color = ?, notification_preferences = ? WHERE user_id = ?')
            ->execute([$avatarKey, $avatarColor, json_encode(['learning_reminder' => $preferences['learning_reminder']], JSON_THROW_ON_ERROR), $userId]);
        $pdo->commit();
        $_SESSION['user_name'] = $name;
        api_json(['ok' => true, 'name' => $name]);
    }

    if ($action === 'password') {
        $current = (string)($input['current_password'] ?? '');
        $new = (string)($input['new_password'] ?? '');
        if (strlen($new) < 8 || strlen($new) > 72) api_error('invalid_password', 'A nova senha deve ter entre 8 e 72 caracteres.', 422);
        $query = $pdo->prepare('SELECT password_hash FROM users WHERE user_id = ?');
        $query->execute([$userId]);
        $hash = (string)$query->fetchColumn();
        if (!password_verify($current, $hash)) api_error('current_password', 'A senha atual não confere.', 422);
        $pdo->prepare('UPDATE users SET password_hash = ? WHERE user_id = ?')->execute([password_hash($new, PASSWORD_DEFAULT), $userId]);
        session_regenerate_id(true);
        api_json(['ok' => true]);
    }

    api_error('unknown_action', 'Ação não reconhecida.', 400);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
    api_db_failure($error);
}
