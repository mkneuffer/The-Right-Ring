<?php
/**
 * Fetch a single diamond by Stock_No.
 * GET /api/diamond.php?id=12345
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id = trim($_GET['id'] ?? '');
if ($id === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id parameter']);
    exit;
}

$data_dir = __DIR__ . '/../data';
$source   = $data_dir . '/diamonds.json';

if (!file_exists($source)) {
    http_response_code(503);
    echo json_encode(['error' => 'Diamond data not available']);
    exit;
}

$raw = file_get_contents($source);
$all = json_decode($raw, true);
if (!is_array($all)) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid diamond data']);
    exit;
}

foreach ($all as $d) {
    if (($d['Stock_No'] ?? '') === $id) {
        echo json_encode(['diamond' => $d]);
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'Diamond not found']);
