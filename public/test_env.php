<?php
require __DIR__ . '/../vendor/autoload.php';

try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
    
    echo "SITE_URL from \$_ENV: " . ($_ENV['SITE_URL'] ?? 'NOT SET') . "\n";
    echo "SITE_URL from \$_SERVER: " . ($_SERVER['SITE_URL'] ?? 'NOT SET') . "\n";
    echo "SITE_URL from getenv: " . (getenv('SITE_URL') ?: 'NOT SET') . "\n";
    
    $siteUrl = rtrim($_ENV['SITE_URL'] ?? 'https://therightring.com', '/');
    echo "Calculated siteUrl: " . $siteUrl . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
