<?php
declare(strict_types=1);

/* Configuração local do Cashy. Preencha a senha usada no seu MySQL Workbench. */
return [
    'host' => '127.0.0.1',
    'port' => 3306,
    'database' => 'cashy',
    'username' => 'root',
    'password' => 'Senai@118',
    // Gere uma chave no Cerebras Cloud e mantenha-a somente neste arquivo local.
    'cerebras_api_key' => '',
    'cerebras_model' => 'gpt-oss-120b',

];
