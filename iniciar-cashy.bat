@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "PHP_EXE="

if exist "C:\xampp\php\php.exe" set "PHP_EXE=C:\xampp\php\php.exe"
if not defined PHP_EXE (
  for /f "delims=" %%P in ('where php 2^>nul') do if not defined PHP_EXE set "PHP_EXE=%%P"
)

if not defined PHP_EXE goto no_php

if not exist "%PROJECT_DIR%api\config.php" (
  copy /Y "%PROJECT_DIR%api\config.example.php" "%PROJECT_DIR%api\config.php" >nul
  echo Criei api\config.php a partir do exemplo.
  echo Confira os dados do MySQL nesse arquivo antes de continuar, se forem diferentes do XAMPP padrao.
  echo.
)

echo Confirme que o MySQL esta iniciado e o banco cashy foi preparado.
echo O navegador abrira em http://127.0.0.1:8000
echo Mantenha esta janela aberta enquanto usa o Cashy.
echo Feche esta janela ou pressione Ctrl+C para encerrar o servidor local.
echo.

pushd "%PROJECT_DIR%"
start "" /B "%PHP_EXE%" -S 127.0.0.1:8000 -t "%PROJECT_DIR%" "%PROJECT_DIR%router.php"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8000/index.html"
pause >nul
popd
exit /b 0

:no_php
echo Nao encontrei o PHP.
echo Instale o XAMPP em C:\xampp ou adicione php.exe ao PATH.
echo.
pause
exit /b 1
