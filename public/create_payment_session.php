<?php
use Stripe\Stripe;
use Stripe\Checkout\Session;

require __DIR__ . '/../vendor/autoload.php';

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? '';
$siteUrl = rtrim($_ENV['SITE_URL'] ?? 'https://therightring.com', '/');

if (empty($stripeSecretKey)) {
    echo json_encode(['success' => false, 'message' => 'Stripe configuration missing']);
    exit();
}

Stripe::setApiKey($stripeSecretKey);

try {
    $session = Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => 'Custom Ring Design Deposit',
                    'description' => 'Deposit to begin your custom ring design process.',
                ],
                'unit_amount' => 50000, // $500.00 in cents
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => $siteUrl . '/?payment_success=true&session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $siteUrl . '/?payment_canceled=true',
        'customer_email' => $input['email'] ?? null,
        'metadata' => [
            'customer_name' => $input['name'] ?? '',
            'design_summary' => 'Initial Deposit'
        ]
    ]);

    echo json_encode(['success' => true, 'url' => $session->url]);

} catch (Exception $e) {
    error_log("Stripe Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
