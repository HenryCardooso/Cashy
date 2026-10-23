<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$action = (string)($_GET['action'] ?? '');

try {
    if ($method === 'GET' && $action === 'csrf') {
        api_json(['ok' => true, 'csrf_token' => api_csrf_token()]);
    }

    if ($method === 'GET' && $action === 'me') {
        $userId = filter_var($_SESSION['user_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$userId || $userId < 1) {
            api_json(['ok' => true, 'authenticated' => false]);
        }
        $statement = api_db()->prepare('SELECT user_id, full_name, email FROM users WHERE user_id = ?');
        $statement->execute([(int)$userId]);
        $user = $statement->fetch();
        if (!$user) {
            api_clear_session();
            api_json(['ok' => true, 'authenticated' => false]);
        }
        api_json([
            'ok' => true,
            'authenticated' => true,
            'user' => [
                'id' => (int)$user['user_id'],
                'name' => $user['full_name'],
                'email' => $user['email'],
            ],
        ]);
    }

    if ($method !== 'POST') {
        api_method('GET', 'POST');
    }

    api_require_csrf();
    $input = api_input();
    $action = (string)($input['action'] ?? '');

    if ($action === 'register') {
        $name = trim((string)($input['name'] ?? ''));
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');
        if (mb_strlen($name, 'UTF-8') < 2 || mb_strlen($name, 'UTF-8') > 80) {
            api_error('invalid_name', 'Informe um nome entre 2 e 80 caracteres.', 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
            api_error('invalid_email', 'Digite um e-mail válido.', 422);
        }
        if (strlen($password) < 8 || strlen($password) > 72) {
            api_error('invalid_password', 'A senha deve ter entre 8 e 72 caracteres.', 422);
        }

        $pdo = api_db();
        try {
            $statement = $pdo->prepare('INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)');
            $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
        } catch (PDOException $error) {
            if (($error->errorInfo[1] ?? null) === 1062) {
                api_error('email_exists', 'Este e-mail já tem uma conta. Entre ou use outro e-mail.', 409);
            }
            throw $error;
        }
        $userId = (int)$pdo->lastInsertId();
        api_login_user($userId, $name, $email, (bool)($input['remember'] ?? false));
        api_json(['ok' => true, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email], 'csrf_token' => api_csrf_token()], 201);
    }

    if ($action === 'login') {
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190 || $password === '' || strlen($password) > 72) {
            api_error('invalid_credentials', 'E-mail ou senha incorretos.', 401);
        }
        $statement = api_db()->prepare('SELECT user_id, full_name, email, password_hash FROM users WHERE email = ?');
        $statement->execute([$email]);
        $user = $statement->fetch();
        if (!$user || !password_verify($password, (string)$user['password_hash'])) {
            api_error('invalid_credentials', 'E-mail ou senha incorretos. Confira seus dados ou crie uma conta.', 401);
        }
        if (password_needs_rehash((string)$user['password_hash'], PASSWORD_DEFAULT)) {
            $update = api_db()->prepare('UPDATE users SET password_hash = ? WHERE user_id = ?');
            $update->execute([password_hash($password, PASSWORD_DEFAULT), (int)$user['user_id']]);
        }
        api_login_user((int)$user['user_id'], (string)$user['full_name'], (string)$user['email'], (bool)($input['remember'] ?? false));
        api_json(['ok' => true, 'user' => ['id' => (int)$user['user_id'], 'name' => $user['full_name'], 'email' => $user['email']], 'csrf_token' => api_csrf_token()]);
    }

    if ($action === 'logout') {
        api_clear_session();
        api_json(['ok' => true]);
    }

    api_error('unknown_action', 'Ação não reconhecida.', 400);
} catch (Throwable $error) {
    api_db_failure($error);
}