<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$courseRules = [
    'primeiros-passos' => ['topics' => 6, 'answers' => [0, 1, 2]],
    'entendendo-investimentos' => ['topics' => 6, 'answers' => [1, 0, 1]],
    'aprenda-escolher' => ['topics' => 6, 'answers' => [1, 1, 1]],
    'juros-compostos' => ['topics' => 5, 'answers' => [0, 1, 1]],
    'renda-fixa' => ['topics' => 5, 'answers' => [0, 1, 1]],
    'fundos-acoes-fiis' => ['topics' => 5, 'answers' => [0, 1, 0]],
    'diversificacao' => ['topics' => 5, 'answers' => [0, 1, 1]],
    'monte-planejamento' => ['topics' => 7, 'answers' => [0, 1, 1]],
];

function education_event(PDO $pdo, int $userId, string $courseId, string $type, int $topicIndex, string $rewardKey, int $points, array $details): void
{
    $statement = $pdo->prepare('INSERT IGNORE INTO education_activity (user_id, course_id, event_type, topic_index, reward_key, points, details_json) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $statement->execute([$userId, $courseId, $type, $topicIndex, $rewardKey, $points, json_encode($details, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)]);
}

try {
    $userId = api_require_user();
    $pdo = api_db();

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        $progressQuery = $pdo->prepare('SELECT course_id, completed_at FROM course_progress WHERE user_id = ? ORDER BY completed_at ASC');
        $progressQuery->execute([$userId]);
        $statesQuery = $pdo->prepare('SELECT course_id, last_topic_index, completed_topics, quiz_history, last_accessed_at FROM education_course_state WHERE user_id = ? ORDER BY last_accessed_at DESC');
        $statesQuery->execute([$userId]);
        $states = [];
        foreach ($statesQuery->fetchAll() as $row) {
            $states[$row['course_id']] = [
                'last_topic_index' => (int)$row['last_topic_index'],
                'completed_topics' => json_decode((string)$row['completed_topics'], true) ?: [],
                'quiz_history' => json_decode((string)$row['quiz_history'], true) ?: [],
                'last_accessed_at' => $row['last_accessed_at'],
            ];
        }
        $checklistQuery = $pdo->prepare('SELECT checklist_json FROM education_checklists WHERE user_id = ?');
        $checklistQuery->execute([$userId]);
        $checklistRow = $checklistQuery->fetch();
        $checklist = $checklistRow ? json_decode((string)$checklistRow['checklist_json'], true) : [];
        $activityQuery = $pdo->prepare('SELECT event_type, course_id, points, details_json, created_at FROM education_activity WHERE user_id = ? ORDER BY created_at DESC, activity_id DESC LIMIT 20');
        $activityQuery->execute([$userId]);
        $activity = $activityQuery->fetchAll();
        $datesQuery = $pdo->prepare('SELECT DISTINCT DATE(created_at) AS study_date FROM education_activity WHERE user_id = ? AND event_type IN (\'topic_completed\', \'quiz_completed\', \'course_completed\') ORDER BY study_date DESC LIMIT 400');
        $datesQuery->execute([$userId]);
        $studyDates = array_column($datesQuery->fetchAll(), 'study_date');
        $today = date('Y-m-d');
        $cursor = in_array($today, $studyDates, true) ? $today : date('Y-m-d', strtotime('-1 day'));
        $streak = 0;
        while (in_array($cursor, $studyDates, true)) { $streak++; $cursor = date('Y-m-d', strtotime($cursor . ' -1 day')); }
        $xpQuery = $pdo->prepare('SELECT COALESCE(SUM(points), 0) FROM education_activity WHERE user_id = ?');
        $xpQuery->execute([$userId]);
        $weekStart = (new DateTimeImmutable('monday this week'))->format('Y-m-d 00:00:00');
        $weekQuery = $pdo->prepare('SELECT COUNT(*) FROM education_activity WHERE user_id = ? AND event_type = \'topic_completed\' AND created_at >= ?');
        $weekQuery->execute([$userId, $weekStart]);
        api_json([
            'ok' => true,
            'completed' => array_column($progressQuery->fetchAll(), 'course_id'),
            'states' => $states,
            'checklist' => is_array($checklist) ? $checklist : [],
            'xp' => (int)$xpQuery->fetchColumn(),
            'streak' => $streak,
            'weekly_topics' => (int)$weekQuery->fetchColumn(),
            'activity' => array_map(static function (array $row): array {
                return ['type' => $row['event_type'], 'course_id' => $row['course_id'], 'points' => (int)$row['points'], 'details' => json_decode((string)$row['details_json'], true) ?: [], 'created_at' => $row['created_at']];
            }, $activity),
        ]);
    }

    api_method('POST');
    api_require_csrf();
    $input = api_input();
    $action = (string)($input['action'] ?? '');

    if ($action === 'checklist') {
        $items = $input['items'] ?? null;
        if (!is_array($items) || count($items) > 50) api_error('invalid_checklist', 'As respostas do checklist estão inválidas.', 422);
        foreach ($items as $item) if (!is_bool($item)) api_error('invalid_checklist', 'As respostas do checklist estão inválidas.', 422);
        $json = json_encode(array_values($items), JSON_THROW_ON_ERROR);
        $statement = $pdo->prepare('INSERT INTO education_checklists (user_id, checklist_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE checklist_json = VALUES(checklist_json)');
        $statement->execute([$userId, $json]);
        api_json(['ok' => true]);
    }

    $courseId = (string)($input['course_id'] ?? '');
    if (!isset($courseRules[$courseId])) api_error('invalid_course', 'Curso não reconhecido.', 422);
    $empty = json_encode([], JSON_THROW_ON_ERROR);
    $pdo->prepare('INSERT IGNORE INTO education_course_state (user_id, course_id, completed_topics, quiz_history) VALUES (?, ?, ?, ?)')->execute([$userId, $courseId, $empty, $empty]);

    if ($action === 'open') {
        $pdo->prepare('UPDATE education_course_state SET last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?')->execute([$userId, $courseId]);
        education_event($pdo, $userId, $courseId, 'course_opened', -1, 'open:' . $courseId, 0, []);
        api_json(['ok' => true]);
    }

    if ($action === 'topic') {
        $topicIndex = filter_var($input['topic_index'] ?? null, FILTER_VALIDATE_INT);
        if ($topicIndex === false || $topicIndex < 0 || $topicIndex >= $courseRules[$courseId]['topics']) api_error('invalid_topic', 'Etapa não reconhecida.', 422);
        $query = $pdo->prepare('SELECT completed_topics FROM education_course_state WHERE user_id = ? AND course_id = ?');
        $query->execute([$userId, $courseId]);
        $completedTopics = json_decode((string)$query->fetchColumn(), true) ?: [];
        if (!in_array($topicIndex, $completedTopics, true) && $topicIndex > count($completedTopics)) api_error('topic_sequence', 'Conclua as etapas anteriores antes de avançar.', 409);
        if (!in_array($topicIndex, $completedTopics, true)) $completedTopics[] = $topicIndex;
        $pdo->prepare('UPDATE education_course_state SET last_topic_index = ?, completed_topics = ?, last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?')->execute([$topicIndex, json_encode(array_values($completedTopics), JSON_THROW_ON_ERROR), $userId, $courseId]);
        education_event($pdo, $userId, $courseId, 'topic_completed', $topicIndex, 'topic:' . $courseId . ':' . $topicIndex, 5, ['topic_index' => $topicIndex]);
        api_json(['ok' => true, 'completed_topics' => array_values($completedTopics)]);
    }

    if ($action === 'quiz') {
        $answers = $input['answers'] ?? null;
        $score = filter_var($input['score'] ?? null, FILTER_VALIDATE_INT);
        $total = filter_var($input['total'] ?? null, FILTER_VALIDATE_INT);
        $correctAnswers = $courseRules[$courseId]['answers'];
        if (!is_array($answers) || count($answers) !== count($correctAnswers) || $total !== count($correctAnswers) || $score === false || $score < 0 || $score > $total) api_error('invalid_quiz', 'As respostas do quiz estão inválidas.', 422);
        foreach ($answers as $answer) if (!is_int($answer) || $answer < 0 || $answer > 20) api_error('invalid_quiz', 'As respostas do quiz estão inválidas.', 422);
        $actualScore = 0;
        foreach ($correctAnswers as $index => $correctAnswer) if ($answers[$index] === $correctAnswer) $actualScore++;
        if ($score !== $actualScore) api_error('invalid_quiz', 'A pontuação enviada não corresponde às respostas.', 422);
        $query = $pdo->prepare('SELECT quiz_history FROM education_course_state WHERE user_id = ? AND course_id = ?');
        $query->execute([$userId, $courseId]);
        $history = json_decode((string)$query->fetchColumn(), true) ?: [];
        $history[] = ['answers' => array_values($answers), 'score' => $score, 'total' => $total, 'created_at' => date(DATE_ATOM)];
        $history = array_slice($history, -20);
        $pdo->prepare('UPDATE education_course_state SET quiz_history = ?, last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?')->execute([json_encode($history, JSON_THROW_ON_ERROR), $userId, $courseId]);
        education_event($pdo, $userId, $courseId, 'quiz_completed', -1, 'quiz:' . $courseId, 10, ['score' => $score, 'total' => $total]);
        api_json(['ok' => true, 'history' => $history]);
    }

    if ($action === 'complete') {
        $query = $pdo->prepare('SELECT quiz_history FROM education_course_state WHERE user_id = ? AND course_id = ?');
        $query->execute([$userId, $courseId]);
        $history = json_decode((string)$query->fetchColumn(), true) ?: [];
        $passed = array_filter($history, static fn(array $item): bool => ($item['score'] ?? -1) === ($item['total'] ?? 0));
        if (!$passed) api_error('quiz_required', 'Conclua o quiz com todas as respostas corretas antes de marcar o curso como concluído.', 409);
        $pdo->prepare('INSERT IGNORE INTO course_progress (user_id, course_id) VALUES (?, ?)')->execute([$userId, $courseId]);
        education_event($pdo, $userId, $courseId, 'course_completed', -1, 'complete:' . $courseId, 20, []);
        api_json(['ok' => true, 'course_id' => $courseId]);
    }

    api_error('unknown_action', 'Ação não reconhecida.', 400);
} catch (Throwable $error) {
    api_db_failure($error);
}
