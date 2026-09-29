<?php
/**
 * ACF EDUHUB — DATABASE CONFIGURATION & PDO CONNECTOR
 * Multi-environment connection handler (XAMPP / Laragon / Production)
 */

// Enable error reporting in development (bisa dinonaktifkan di production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set default timezone
date_default_timezone_set('Asia/Jakarta');

// Database Connection Settings
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'db_acf');
define('DB_PORT', 3306);
define('DB_CHARSET', 'utf8mb4');

/**
 * Handle CORS Headers for REST API communication
 */
function setCorsHeaders() {
    // Izinkan semua origin atau sesuaikan jika di domain tertentu
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // cache 1 day
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
    header("Content-Type: application/json; charset=UTF-8");

    // Tangani preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Inisialisasi header CORS pada setiap pemanggilan API
setCorsHeaders();

/**
 * Mendapatkan koneksi PDO ke database MySQL
 * @return PDO
 */
function getDbConnection() {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Koneksi database gagal: ' . $e->getMessage(),
                'hint'    => 'Pastikan MySQL aktif di XAMPP/Laragon dan database `db_acf` sudah diimpor.'
            ]);
            exit();
        }
    }

    return $pdo;
}

/**
 * Helper JSON Response Sukses
 */
function jsonSuccess($data = null, $message = 'Berhasil', $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Helper JSON Response Error
 */
function jsonError($message = 'Terjadi kesalahan', $statusCode = 400, $errors = null) {
    http_response_code($statusCode);
    $res = [
        'success' => false,
        'message' => $message
    ];
    if ($errors !== null) {
        $res['errors'] = $errors;
    }
    echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Mengambil JSON Payload dari Request Body
 */
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? array_merge($_POST, $decoded) : $_POST;
}
