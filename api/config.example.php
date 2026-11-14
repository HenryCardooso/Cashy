<?php
declare(strict_types=1);

/*
 * Copie este arquivo para config.php e informe os dados locais do MySQL.
 * Não publique config.php: ele contém a senha do banco.
 */
return [
    'host' => '127.0.0.1',
    'port' => 3306,
    'database' => 'cashy',
    'username' => 'root',
    'password' => '',
    // Gere a chave no GroqCloud e mantenha-a somente em config.php.
    'groq_api_key' => '',
    'groq_model' => 'openai/gpt-oss-120b',
];
