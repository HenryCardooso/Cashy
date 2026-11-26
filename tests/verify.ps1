$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$node = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $node) { throw "Node.js não encontrado. Instale Node.js para validar os arquivos JavaScript." }

$jsFiles = @(Get-ChildItem -Path (Join-Path $projectRoot "js") -Filter "*.js" -File -Recurse)
$phpFiles = @(Get-ChildItem -Path (Join-Path $projectRoot "api") -Filter "*.php" -File -Recurse) + @(Get-ChildItem -Path (Join-Path $projectRoot "tests") -Filter "*.php" -File -Recurse)
$htmlFiles = @(Get-ChildItem -Path $projectRoot -Filter "*.html" -File)
$failures = [System.Collections.Generic.List[string]]::new()

foreach ($file in $jsFiles) {
    & $node.Source --check $file.FullName 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { $failures.Add("JavaScript: $($file.FullName)") }
}

$php = Get-Command php.exe -ErrorAction SilentlyContinue
if (-not $php -and (Test-Path "C:\xampp\php\php.exe")) { $phpPath = "C:\xampp\php\php.exe" }
elseif ($php) { $phpPath = $php.Source }
else { throw "PHP não encontrado. Instale PHP CLI para validar a API." }
foreach ($file in $phpFiles) {
    & $phpPath -l $file.FullName 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { $failures.Add("PHP: $($file.FullName)") }
}
& $phpPath (Join-Path $PSScriptRoot "indicators.test.php") 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { $failures.Add("PHP indicator data tests") }
& $node.Source --test (Join-Path $PSScriptRoot "financial-math.test.cjs")
if ($LASTEXITCODE -ne 0) { $failures.Add("JavaScript financial math tests") }

foreach ($file in $htmlFiles) {
    $html = Get-Content -LiteralPath $file.FullName -Raw
    $references = [regex]::Matches($html, '(?:href|src)="(?!https?:|mailto:|tel:|#|data:)([^"]+)"')
    foreach ($reference in $references) {
        $relative = ($reference.Groups[1].Value -split '[?#]')[0]
        if ($relative -and -not (Test-Path -LiteralPath (Join-Path $projectRoot $relative))) {
            $failures.Add("Link local ausente em $($file.Name): $relative")
        }
    }
}

if ($failures.Count) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}
Write-Output "OK: $($jsFiles.Count) JavaScript files, $($phpFiles.Count) PHP files, and $($htmlFiles.Count) HTML pages validated."
