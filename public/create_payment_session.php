<?php
use Stripe\Stripe;
use Stripe\Checkout\Session;

require __DIR__ . '/../vendor/autoload.php';

// Load .env (may be empty on Railway — env vars come from system environment)
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

// Sync system environment variables into $_ENV so Railway-injected vars are accessible
foreach (getenv() as $key => $value) {
    if (!isset($_ENV[$key])) {
        $_ENV[$key] = $value;
    }
}

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
        'payment_method_types' => ['card', 'affirm', 'klarna', 'link'],
        'line_items' => [[
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => 'Custom Ring Design Deposit ($250)',
                    'description' => 'Non-refundable deposit applied toward your final ring price. Begins the 3D model process.',
                ],
                'unit_amount' => 25000, // $250.00 in cents
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => $siteUrl . '/index.html?payment_success=true&session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $siteUrl . '/index.html?payment_canceled=true',
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
