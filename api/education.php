<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$allowedCourses = [
    'primeiros-passos',
    'entendendo-investimentos',
    'aprenda-escolher',
    'juros-compostos',
    'renda-fixa',
    'fundos-acoes-fiis',
    'diversificacao',
    'monte-planejamento',
];

try {
    $userId = api_require_user();
    $pdo = api_db();

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        $progressQuery = $pdo->prepare('SELECT course_id FROM course_progress WHERE user_id = ? ORDER BY completed_at ASC');
        $progressQuery->execute([$userId]);
        $checklistQuery = $pdo->prepare('SELECT checklist_json FROM education_checklists WHERE user_id = ?');
        $checklistQuery->execute([$userId]);
        $checklistRow = $checklistQuery->fetch();
        $checklist = $checklistRow ? json_decode((string)$checklistRow['checklist_json'], true) : [];
        api_json([
            'ok' => true,
            'completed' => array_column($progressQuery->fetchAll(), 'course_id'),
            'checklist' => is_array($checklist) ? $checklist : [],
        ]);
    }

    api_method('GET', 'POST');
    api_require_csrf();
    $input = api_input();
    $action = (string)($input['action'] ?? '');

    if ($action === 'complete') {
        $courseId = (string)($input['course_id'] ?? '');
        if (!in_array($courseId, $allowedCourses, true)) {
            api_error('invalid_course', 'Curso não reconhecido.', 422);
        }
        $statement = $pdo->prepare('INSERT IGNORE INTO course_progress (user_id, course_id) VALUES (?, ?)');
        $statement->execute([$userId, $courseId]);
        api_json(['ok' => true, 'course_id' => $courseId]);
    }

    if ($action === 'checklist') {
        $items = $input['items'] ?? null;
        if (!is_array($items) || count($items) > 50) {
            api_error('invalid_checklist', 'As respostas do checklist estão inválidas.', 422);
        }
        foreach ($items as $item) {
            if (!is_bool($item)) {
                api_error('invalid_checklist', 'As respostas do checklist estão inválidas.', 422);
            }
        }
        $json = json_encode(array_values($items), JSON_THROW_ON_ERROR);
        $statement = $pdo->prepare(
            'INSERT INTO education_checklists (user_id, checklist_json) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE checklist_json = VALUES(checklist_json)'
        );
        $statement->execute([$userId, $json]);
        api_json(['ok' => true]);
    }

    api_error('unknown_action', 'Ação não reconhecida.', 400);
} catch (Throwable $error) {
    api_db_failure($error);
}