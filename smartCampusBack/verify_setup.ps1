# Script PowerShell de vérification pour Windows
# Exécutez ce fichier pour vérifier que tout est configuré correctement

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION SMART CAMPUS - Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier Java
Write-Host "[1/5] Vérification Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    if ($javaVersion) {
        Write-Host "   ✓ Java trouvé: $javaVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Java non trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Java non trouvé - Installez Java 17+" -ForegroundColor Red
}

# 2. Vérifier Maven Wrapper
Write-Host ""
Write-Host "[2/5] Vérification Maven Wrapper..." -ForegroundColor Yellow
if (Test-Path "mvnw.cmd") {
    Write-Host "   ✓ mvnw.cmd trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ mvnw.cmd non trouvé - Assurez-vous d'être dans le bon dossier" -ForegroundColor Red
}

# 3. Vérifier PostgreSQL
Write-Host ""
Write-Host "[3/5] Vérification PostgreSQL..." -ForegroundColor Yellow
try {
    $result = psql -U postgres -c "SELECT 1" 2>&1
    if ($result) {
        Write-Host "   ✓ PostgreSQL accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PostgreSQL non accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ PostgreSQL non accessible - Vérifiez que PostgreSQL est en cours d'exécution" -ForegroundColor Red
}

# 4. Vérifier base de données
Write-Host ""
Write-Host "[4/5] Vérification base de données..." -ForegroundColor Yellow
try {
    $dbList = psql -U postgres -l 2>&1 | Select-String "smart_campus"
    if ($dbList) {
        Write-Host "   ✓ Base de données 'smart_campus' existe" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Base de données 'smart_campus' non trouvée" -ForegroundColor Yellow
        Write-Host "     Exécutez: createdb smart_campus" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠ Impossible de vérifier la base de données" -ForegroundColor Yellow
}

# 5. Vérifier port 8080
Write-Host ""
Write-Host "[5/5] Vérification port 8080..." -ForegroundColor Yellow
$port8080 = netstat -ano | Select-String ":8080"
if ($port8080) {
    Write-Host "   ⚠ Port 8080 déjà utilisé" -ForegroundColor Yellow
    Write-Host "     Vous devrez changer le port ou arrêter l'application qui l'utilise" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Port 8080 libre" -ForegroundColor Green
}

# Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RÉSUMÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Si tous les tests sont OK, vous pouvez démarrer l'application:" -ForegroundColor Green
Write-Host "   .\mvnw spring-boot:run" -ForegroundColor Green
Write-Host ""
Write-Host "❌ Si un test a échoué, consultez TROUBLESHOOTING_WINDOWS.md" -ForegroundColor Yellow
Write-Host ""

