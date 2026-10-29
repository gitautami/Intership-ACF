<?php
/**
 * ACF EDUHUB — GEMINI AI CONFIGURATION
 * Konfigurasi API Google Gemini (Free Tier) untuk Chatbot "Cherry"
 */

// 1. Cek kunci API dari Environment Variable atau file gemini_key.txt jika ada
$gemini_api_key = getenv('GEMINI_API_KEY');

if (!$gemini_api_key) {
    $key_file = __DIR__ . '/gemini_key.txt';
    if (file_exists($key_file)) {
        $gemini_api_key = trim(file_get_contents($key_file));
    }
}

// 2. Jika belum diisi, dapat diisikan langsung pada konstanta ini:
if (!$gemini_api_key) {
    // Masukkan Google Gemini Free API Key Anda di sini atau lewat file gemini_key.txt
    $gemini_api_key = '';
}

define('GEMINI_API_KEY', $gemini_api_key);
define('GEMINI_MODEL', 'gemini-1.5-flash'); // Model free tier cepat & cerdas dari Google
define('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/' . GEMINI_MODEL . ':generateContent');

