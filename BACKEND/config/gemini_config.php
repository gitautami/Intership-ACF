<?php
/**
 * ACF EDUHUB — GEMINI AI CONFIGURATION
 * Konfigurasi API Google Gemini (Free Tier) untuk Chatbot "Cherry"
 */

// Fungsi pembaca file .env lokal project (tanpa library eksternal)
function loadProjectEnvFile() {
    $possiblePaths = [
        __DIR__ . '/../../.env',       // Root project: Intership-ACF/.env (rekomendasi)
        __DIR__ . '/../.env',          // BACKEND/.env
        __DIR__ . '/.env'              // BACKEND/config/.env
    ];

    foreach ($possiblePaths as $envPath) {
        if (file_exists($envPath) && is_readable($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || strpos($line, '#') === 0) continue;
                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    $name = trim($name);
                    $value = trim($value);
                    $value = trim($value, "\"' \t\n\r\0\x0B");
                    if (!empty($name) && getenv($name) === false) {
                        putenv("{$name}={$value}");
                        $_ENV[$name] = $value;
                        $_SERVER[$name] = $value;
                    }
                }
            }
            break;
        }
    }
}

loadProjectEnvFile();

// 1. Ambil kunci API dari .env lokal project
$gemini_api_key = getenv('GEMINI_API_KEY');

// Abaikan jika masih berupa teks template bawaan
if ($gemini_api_key === 'MASUKKAN_API_KEY_GEMINI_ANDA_DI_SINI') {
    $gemini_api_key = '';
}

// 2. Cek file alternatif gemini_key.txt jika ada
if (!$gemini_api_key) {
    $key_file = __DIR__ . '/gemini_key.txt';
    if (file_exists($key_file)) {
        $gemini_api_key = trim(file_get_contents($key_file));
    }
}

// 3. Model Gemini (default gemini-3.1-flash-lite)
$gemini_model = getenv('GEMINI_MODEL') ?: 'gemini-3.1-flash-lite';

define('GEMINI_API_KEY', $gemini_api_key ?: '');
define('GEMINI_MODEL', $gemini_model);
define('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/' . GEMINI_MODEL . ':generateContent');
