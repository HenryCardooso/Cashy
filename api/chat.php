<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

api_method('POST');
api_require_csrf();

$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 60000) {
    api_error('request_too_large', 'A conversa enviada é muito grande. Comece uma nova pergunta.', 413);
}

$input = api_input();
$messages = $input['messages'] ?? null;
if (!is_array($messages) || count($messages) < 1 || count($messages) > 8) {
    api_error('invalid_messages', 'Escreva uma pergunta para começar.', 422);
}

$cleanMessages = [];
foreach (array_slice($messages, -8) as $message) {
    if (!is_array($message)) {
        api_error('invalid_messages', 'A conversa enviada não está válida.', 422);
    }
    $role = (string)($message['role'] ?? '');
    $content = trim((string)($message['content'] ?? ''));
    if (!in_array($role, ['user', 'assistant'], true) || $content === '' || mb_strlen($content, 'UTF-8') > 1200) {
        api_error('invalid_messages', 'Cada mensagem deve ter até 1.200 caracteres.', 422);
    }
    $cleanMessages[] = ['role' => $role, 'content' => $content];
}
if (($cleanMessages[count($cleanMessages) - 1]['role'] ?? '') !== 'user') {
    api_error('invalid_messages', 'Envie uma nova pergunta para continuar.', 422);
}

$config = [];
$configPath = __DIR__ . '/config.php';
if (is_file($configPath)) {
    $loadedConfig = require $configPath;
    if (is_array($loadedConfig)) {
        $config = $loadedConfig;
    }
}
$apiKey = trim((string)(getenv('GEMINI_API_KEY') ?: ($config['gemini_api_key'] ?? '')));
if ($apiKey === '') {
    api_error('ai_not_configured', 'O assistente ainda não está configurado. Adicione uma chave Gemini no servidor para habilitá-lo.', 503);
}

if (!function_exists('curl_init')) {
    error_log('[Cashy chat] A extensão cURL do PHP não está habilitada.');
    api_error('chat_unavailable', 'O assistente está temporariamente indisponível. Tente novamente mais tarde.', 503);
}

// Limite simples por sessão para reduzir abuso e consumo inesperado da API.
$now = time();
$recentRequests = array_values(array_filter(
    $_SESSION['chat_requests'] ?? [],
    static fn($timestamp): bool => is_int($timestamp) && $timestamp > $now - 1800
));
if (count($recentRequests) >= 12) {
    api_error('rate_limited', 'Você chegou ao limite temporário de perguntas. Tente novamente em alguns minutos.', 429);
}
$_SESSION['chat_requests'] = [...$recentRequests, $now];

$model = trim((string)(getenv('GEMINI_MODEL') ?: ($config['gemini_model'] ?? 'gemini-3.8-flash')));
if (!preg_match('/^[a-zA-Z0-9._-]{1,100}$/', $model)) {
    $model = 'gemini-3.8-flash';
}

$instructions = <<<'PROMPT'
Você é o assistente educativo do Cashy, um site brasileiro para pessoas que estão começando a aprender sobre dinheiro e investimentos. Responda sempre em português do Brasil, com linguagem acolhedora, clara e adequada para iniciantes. Explique conceitos e ajude a pessoa a aprender, sem pressioná-la a investir.

Não dê recomendações financeiras personalizadas nem diga para comprar, vender ou escolher um ativo, produto, corretora ou investimento específico. Quando perguntarem o que fazer com o próprio dinheiro, explique quais fatores a pessoa pode estudar — objetivo, prazo, liquidez, riscos, custos, impostos e regras — sem decidir por ela. Nunca prometa rendimento ou segurança absoluta.

Não invente cotações, taxas, notícias, regras atuais ou dados de produtos. Você não consulta dados de mercado em tempo real. Se a pergunta depender de informação atual, diga isso claramente e encaminhe a pessoa para documentos do produto e fontes oficiais, como o Portal do Investidor da CVM (gov.br/investidor) ou o Banco Central (bcb.gov.br).

Use exemplos hipotéticos identificados como exemplos. Diferencie fato geral, hipótese e incerteza. Se não souber, diga que não sabe. Não solicite nem tente inferir senha, e-mail, saldo, movimentações ou metas privadas da conta. O Cashy não fornece esses dados a você. Prefira respostas curtas, em poucos parágrafos, e ofereça explicar um termo relacionado quando fizer sentido.
PROMPT;

$geminiMessages = array_map(static function (array $message): array {
    return [
        'role' => $message['role'] === 'assistant' ? 'model' : 'user',
        'parts' => [['text' => $message['content']]],
    ];
}, $cleanMessages);

$payload = json_encode([
    'systemInstruction' => ['parts' => [['text' => $instructions]]],
    'contents' => $geminiMessages,
    'generationConfig' => [
        'maxOutputTokens' => 450,
        'temperature' => 0.4,
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);

$handle = curl_init('https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent');
curl_setopt_array($handle, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 35,
    CURLOPT_HTTPHEADER => [
        'x-goog-api-key: ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS => $payload,
]);
$responseBody = curl_exec($handle);
$curlError = curl_errno($handle);
$httpStatus = (int)curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
curl_close($handle);

if ($responseBody === false || $curlError !== 0) {
    error_log('[Cashy chat] A chamada à API falhou. Código cURL: ' . $curlError);
    api_error('chat_unavailable', 'Não consegui responder agora. Confira sua conexão e tente novamente.', 502);
}

$response = json_decode($responseBody, true);
if ($httpStatus === 429) {
    api_error('rate_limited', 'A cota gratuita do assistente foi atingida por enquanto. Tente novamente mais tarde.', 429);
}
if ($httpStatus < 200 || $httpStatus >= 300 || !is_array($response)) {
    error_log('[Cashy chat] A API retornou HTTP ' . $httpStatus . '.');
    api_error('chat_unavailable', 'O assistente não conseguiu responder agora. Tente novamente mais tarde.', 502);
}

$answerParts = [];
foreach (($response['candidates'][0]['content']['parts'] ?? []) as $part) {
    if (isset($part['text']) && is_string($part['text'])) {
        $answerParts[] = $part['text'];
    }
}
$answer = trim(implode("\n", $answerParts));
if ($answer === '') {
    api_error('empty_answer', 'Não consegui montar uma resposta. Tente fazer a pergunta de outro jeito.', 502);
}

api_json(['ok' => true, 'answer' => $answer]);
