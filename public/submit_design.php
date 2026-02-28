<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

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

$input = null;

// Handle multipart/form-data (with file uploads)
if (isset($_POST['payload'])) {
    $input = json_decode($_POST['payload'], true);
} 
// Handle raw JSON (fallback)
else {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $input = json_decode($rawInput, true);
    }
}

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$name = $input['name'] ?? 'Unknown';
$email = $input['email'] ?? '';
$phone = $input['phone'] ?? '';
$info = $input['info'] ?? '';
$design = $input['design'] ?? [];
$selections = $input['selections'] ?? [];

// Debug logging
error_log("Received selections: " . json_encode($selections));
error_log("Selections count: " . count($selections));

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit();
}

// ── Brand & Style Variables ──
$brandColor = '#8B7355';
$brandDark  = '#6B5745';
$brandLight = '#FAF7F2';
$textDark   = '#1a1a2e';
$textMuted  = '#6b7280';
$siteUrl    = rtrim($_ENV['SITE_URL'] ?? $_SERVER['SITE_URL'] ?? getenv('SITE_URL') ?? 'https://therightring.com', '/');

$debugInfo = [
    'env_site_url'    => $_ENV['SITE_URL'] ?? 'NOT SET',
    'server_site_url' => $_SERVER['SITE_URL'] ?? 'NOT SET',
    'getenv_site_url' => getenv('SITE_URL'),
    'resolved_siteUrl'=> $siteUrl
];

// ── Build Selection Rows ──
$selectionsHtml = '';
$rowIndex = 0;
foreach ($selections as $selection) {
    $selectionName = htmlspecialchars($selection['name'] ?? '');
    $questionText  = htmlspecialchars($selection['questionText'] ?? '');
    $imageUrl      = htmlspecialchars($selection['imageUrl'] ?? '');

    if (!empty($imageUrl) && strpos($imageUrl, 'http') !== 0) {
        $pathParts    = explode('/', ltrim($imageUrl, '/'));
        $encodedParts = array_map('rawurlencode', $pathParts);
        $imageUrl     = $siteUrl . '/' . implode('/', $encodedParts);
    }

    $debugInfo['images'][] = [
        'original' => $selection['imageUrl'] ?? '',
        'final'    => $imageUrl
    ];

    $details = htmlspecialchars($selection['details'] ?? '');
    $rowBg   = ($rowIndex % 2 === 0) ? '#ffffff' : '#faf9f7';

    $imageHtml = '';
    if (isset($selection['questionId']) && $selection['questionId'] === 'budget') {
        $imageHtml = '';
    } else {
        $imageHtml = "<img src='{$imageUrl}' alt='{$selectionName}' width='80' height='80' style='width:80px;height:80px;object-fit:cover;border-radius:6px;display:block;border:0;' />";
    }

    $selectionsHtml .= "
        <tr>
            <td style='padding:16px 20px;border-bottom:1px solid #eee;background-color:{$rowBg};'>
                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation'>
                    <tr>
                        <td width='80' valign='top' style='padding-right:16px;width:80px;'>
                            {$imageHtml}
                        </td>
                        <td valign='middle' style='vertical-align:middle;'>
                            <p style='margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:{$brandColor};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;'>{$questionText}</p>
                            <p style='margin:0 0 4px 0;font-family:Georgia,Times,serif;font-size:16px;color:{$textDark};font-weight:bold;'>{$selectionName}</p>
                            " . ($details ? "<p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{$textMuted};'>{$details}</p>" : "") . "
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    ";
    $rowIndex++;
}

// ── Admin Diamond Info ──
$adminDiamondInfo = '';
foreach ($selections as $selection) {
    if (isset($selection['diamondData'])) {
        $diamond   = $selection['diamondData'];
        $stockNo   = htmlspecialchars($diamond['stockNo'] ?? '');
        $videoLink = htmlspecialchars($diamond['videoLink'] ?? '');
        $certLink  = htmlspecialchars($diamond['certificateLink'] ?? '');

        $adminDiamondInfo = "
            <tr>
                <td style='padding:20px 30px;'>
                    <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='background-color:#fef3c7;border-radius:8px;'>
                        <tr>
                            <td style='padding:20px;'>
                                <p style='margin:0 0 12px 0;font-family:Georgia,Times,serif;font-size:16px;color:#92400e;font-weight:bold;'>&#x2666; Diamond Details</p>
                                <p style='margin:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#78350f;'><strong>Stock #:</strong> {$stockNo}</p>
                                " . ($videoLink ? "<p style='margin:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;'><a href='{$videoLink}' style='color:{$brandColor};text-decoration:underline;'>View Diamond Video</a></p>" : "") . "
                                " . ($certLink ? "<p style='margin:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;'><a href='{$certLink}' style='color:{$brandColor};text-decoration:underline;'>View Certificate</a></p>" : "") . "
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        ";
    }
}

$submissionDate = date('F j, Y \a\t g:i A T');

// ══════════════════════════════════════════
//  MAILER SETUP
// ══════════════════════════════════════════
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USERNAME'];
    $mail->Password   = $_ENV['SMTP_PASSWORD'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = $_ENV['SMTP_PORT'];

    // ── ADMIN EMAIL ──
    $mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
    $mail->addReplyTo($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
    $mail->Sender = $_ENV['SMTP_FROM_EMAIL']; // Helps with SPF/Return-Path
    
    $mail->addAddress('design@therightring.com');

    // Handle Attachments
    if (isset($_FILES['attachments'])) {
        $fileCount = count($_FILES['attachments']['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['attachments']['error'][$i] === UPLOAD_ERR_OK) {
                $tmpName  = $_FILES['attachments']['tmp_name'][$i];
                $fileName = $_FILES['attachments']['name'][$i];
                $mail->addAttachment($tmpName, $fileName);
            }
        }
    }

    $mail->isHTML(true);
    $mail->Subject = "New Ring Design from {$name}";
    $mail->Body    = "
    <!DOCTYPE html>
    <html xmlns='http://www.w3.org/1999/xhtml'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title>New Design Submission</title>
        <!--[if mso]><style>table{border-collapse:collapse;}.fallback-font{font-family:Arial,sans-serif;}</style><![endif]-->
    </head>
    <body style='margin:0;padding:0;background-color:#f4f1ec;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;'>
        <!-- Preheader -->
        <div style='display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f1ec;'>New ring design from {$name} &mdash; {$email} &zwnj;&nbsp;&zwnj;&nbsp;</div>

        <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='background-color:#f4f1ec;'>
            <tr>
                <td align='center' style='padding:40px 16px;'>
                    <!--[if mso]><table width='600' cellpadding='0' cellspacing='0' border='0' align='center'><tr><td><![endif]-->
                    <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;'>

                        <!-- Header -->
                        <tr>
                            <td style='background-color:{$brandDark};padding:36px 30px;text-align:center;'>
                                <p style='margin:0 0 6px 0;font-family:Georgia,Times,serif;font-size:26px;color:#ffffff;font-weight:bold;'>&#x2726; The Right Ring</p>
                                <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase;'>New Design Submission</p>
                            </td>
                        </tr>

                        <!-- Customer Info -->
                        <tr>
                            <td style='padding:30px;'>
                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='background-color:{$brandLight};border-radius:8px;border-left:4px solid {$brandColor};'>
                                    <tr>
                                        <td style='padding:20px 24px;'>
                                            <p style='margin:0 0 14px 0;font-family:Georgia,Times,serif;font-size:18px;color:{$textDark};font-weight:bold;'>Customer Information</p>
                                            <p style='margin:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;'><strong>Name:</strong> {$name}</p>
                                            <p style='margin:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;'><strong>Email:</strong> <a href='mailto:{$email}' style='color:{$brandColor};'>{$email}</a></p>
                                            <p style='margin:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;'><strong>Phone:</strong> {$phone}</p>
                                            " . ($info ? "
                                            <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-top:12px;'>
                                                <tr>
                                                    <td style='padding:12px 16px;background-color:#ffffff;border-radius:6px;border:1px solid #e5e7eb;'>
                                                        <p style='margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:{$textMuted};text-transform:uppercase;font-weight:700;letter-spacing:0.5px;'>Additional Notes</p>
                                                        <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};line-height:1.5;'>{$info}</p>
                                                    </td>
                                                </tr>
                                            </table>" : "") . "
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        {$adminDiamondInfo}

                        <!-- Design Selections -->
                        <tr>
                            <td style='padding:0 30px 30px 30px;'>
                                <p style='margin:0 0 16px 0;font-family:Georgia,Times,serif;font-size:18px;color:{$textDark};font-weight:bold;'>Design Selections</p>
                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;'>
                                    {$selectionsHtml}
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style='padding:20px 30px;text-align:center;background-color:#f9fafb;border-top:1px solid #e5e7eb;'>
                                <p style='margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:{$textMuted};'>Submitted on {$submissionDate}</p>
                                <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:{$textMuted};'>The Right Ring &mdash; Custom Engagement Ring Builder</p>
                            </td>
                        </tr>
                    </table>
                    <!--[if mso]></td></tr></table><![endif]-->
                </td>
            </tr>
        </table>
    </body>
    </html>
    ";


    // Determine payment mode
    $paymentMode = $input['paymentMode'] ?? 'inquiry';
    
    // 1. Send Admin Email (SKIP if this is just a post-payment customer confirmation)
    if ($paymentMode !== 'confirmation_email') {
        $mail->send();
        error_log("Admin email sent successfully");
    }

    // 2. Decide whether to send Customer Email
    $shouldSendCustomerEmail = ($paymentMode === 'inquiry' || $paymentMode === 'confirmation_email');

    if ($shouldSendCustomerEmail) {
        $mail->clearAddresses();
        $mail->clearAttachments(); // Don't send attachments to customer
        
        $mail->addReplyTo($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
        $mail->Sender = $_ENV['SMTP_FROM_EMAIL'];
        
        $mail->addAddress($email, $name);

        // Payment status badge
        $statusBadge = '';
        if ($paymentMode === 'confirmation_email') {
            $statusBadge = "
                <tr>
                    <td style='padding:0 30px 10px 30px;'>
                        <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                            <tr>
                                <td style='padding:6px 14px;background-color:#d1fae5;border-radius:20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#065f46;font-weight:700;'>&#x2714; Deposit Paid &mdash; Design In Progress</td>
                            </tr>
                        </table>
                    </td>
                </tr>";
        } else {
            $statusBadge = "
                <tr>
                    <td style='padding:0 30px 10px 30px;'>
                        <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                            <tr>
                                <td style='padding:6px 14px;background-color:#dbeafe;border-radius:20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1e40af;font-weight:700;'>&#x1F4CB; Inquiry Submitted</td>
                            </tr>
                        </table>
                    </td>
                </tr>";
        }

        $greetingText = ($paymentMode === 'confirmation_email')
            ? "Thank you for your payment! Your custom design process has officially begun. Here's a summary of your beautiful design:"
            : "Thank you for designing your custom ring with us! Here is a summary of your beautiful design:";

        $mail->Subject = "Your Custom Ring Design &mdash; The Right Ring";
        $mail->Body    = "
        <!DOCTYPE html>
        <html xmlns='http://www.w3.org/1999/xhtml'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <meta http-equiv='X-UA-Compatible' content='IE=edge'>
            <title>Your Ring Design</title>
            <!--[if mso]><style>table{border-collapse:collapse;}.fallback-font{font-family:Arial,sans-serif;}</style><![endif]-->
        </head>
        <body style='margin:0;padding:0;background-color:#f4f1ec;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;'>
            <!-- Preheader -->
            <div style='display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f1ec;'>Your custom ring design summary from The Right Ring &zwnj;&nbsp;&zwnj;&nbsp;</div>

            <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='background-color:#f4f1ec;'>
                <tr>
                    <td align='center' style='padding:40px 16px;'>
                        <!--[if mso]><table width='600' cellpadding='0' cellspacing='0' border='0' align='center'><tr><td><![endif]-->
                        <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;'>

                            <!-- Header -->
                            <tr>
                                <td style='background-color:{$brandDark};padding:36px 30px;text-align:center;'>
                                    <p style='margin:0 0 6px 0;font-family:Georgia,Times,serif;font-size:26px;color:#ffffff;font-weight:bold;'>&#x2726; The Right Ring</p>
                                    <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase;'>Your Custom Design</p>
                                </td>
                            </tr>

                            <!-- Greeting -->
                            <tr>
                                <td style='padding:30px 30px 16px 30px;'>
                                    <p style='margin:0 0 8px 0;font-family:Georgia,Times,serif;font-size:22px;color:{$textDark};'>Hi {$name},</p>
                                    <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;line-height:1.6;'>{$greetingText}</p>
                                </td>
                            </tr>

                            {$statusBadge}

                            <!-- Design Selections -->
                            <tr>
                                <td style='padding:20px 30px 30px 30px;'>
                                    <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;'>
                                        {$selectionsHtml}
                                    </table>
                                </td>
                            </tr>

                            <!-- What's Next Timeline -->
                            <tr>
                                <td style='padding:0 30px 30px 30px;'>
                                    <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='background-color:{$brandLight};border-radius:8px;'>
                                        <tr>
                                            <td style='padding:24px;'>
                                                <p style='margin:0 0 16px 0;font-family:Georgia,Times,serif;font-size:18px;color:{$textDark};font-weight:bold;'>What Happens Next?</p>

                                                <!-- Step 1 -->
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>1</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>Design Review</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>Our team reviews your selections within 1&ndash;2 business days.</p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Step 2 -->
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>2</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>Consultation &amp; Quote</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We&rsquo;ll reach out with a detailed quote and design consultation.</p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Step 3 -->
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>3</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>Begin Crafting</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>Once approved, our artisans begin bringing your dream ring to life.</p>
                                                        </td>
                                                    </tr>
                                                </table>

                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Sign Off -->
                            <tr>
                                <td style='padding:0 30px 30px 30px;text-align:center;'>
                                    <p style='margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:{$textDark};'>Best regards,</p>
                                    <p style='margin:0;font-family:Georgia,Times,serif;font-size:16px;color:{$brandDark};font-weight:bold;'>The Right Ring Team</p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style='padding:24px 30px;text-align:center;background-color:#f9fafb;border-top:1px solid #e5e7eb;'>
                                    <p style='margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textDark};font-weight:bold;'>Need to reach us?</p>
                                    <p style='margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{$textMuted};'><a href='mailto:design@therightring.com' style='color:{$brandColor};text-decoration:none;'>design@therightring.com</a></p>
                                    <p style='margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{$textMuted};'><a href='{$siteUrl}' style='color:{$brandColor};text-decoration:none;'>therightring.com</a></p>
                                    <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#9ca3af;'>The Right Ring &mdash; Custom Engagement Ring Builder</p>
                                </td>
                            </tr>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";

        try {
            $mail->send();
            error_log("Customer email sent successfully to: $email");
            echo json_encode(['success' => true, 'message' => 'Design submitted! Check your email.', 'debug' => $debugInfo]);
        } catch (Exception $customerEmailError) {
            error_log("Customer email failed: " . $customerEmailError->getMessage());
            echo json_encode(['success' => true, 'message' => 'Design submitted! Admin notified but customer confirmation email failed.', 'debug' => $debugInfo]);
        }
    } else {
        // Did not send customer email (Deposit Mode)
        echo json_encode(['success' => true, 'message' => 'Design submitted! Payment required for customer confirmation.', 'debug' => $debugInfo]);
    }

    // Google Sheets Integration
    try {
        if (!empty($_ENV['GOOGLE_SHEET_ID'])) {
            $credentialsPath = __DIR__ . '/../google-credentials.json';
            if (file_exists($credentialsPath)) {
                $client = new \Google_Client();
                $client->setApplicationName('The Right Ring - Custom Design Submissions');
                $client->setScopes([\Google_Service_Sheets::SPREADSHEETS]);
                $client->setAuthConfig($credentialsPath);
                $client->setAccessType('offline');

                $service = new \Google_Service_Sheets($client);
                $spreadsheetId = $_ENV['GOOGLE_SHEET_ID'];
                
                $selectionsText = [];
                foreach ($selections as $sel) {
                    $question = $sel['questionText'] ?? '';
                    $answer = $sel['name'] ?? '';
                    $details = $sel['details'] ?? '';
                    $selectionsText[] = "$question: $answer" . ($details ? " ($details)" : "");
                }
                $selectionsString = implode("\n", $selectionsText);

                $values = [
                    [
                        date('Y-m-d H:i:s'),
                        $name,
                        $email,
                        $phone,
                        $info,
                        $selectionsString,
                        $paymentMode
                    ]
                ];
                $body = new \Google_Service_Sheets_ValueRange([
                    'values' => $values
                ]);
                $params = [
                    'valueInputOption' => 'USER_ENTERED'
                ];
                
                $result = $service->spreadsheets_values->append($spreadsheetId, 'A:G', $body, $params);
                error_log("Successfully appended row to Google Sheet");
            } else {
                error_log("Google Sheets credentials not found at $credentialsPath");
            }
        }
    } catch (Exception $sheetError) {
        error_log("Google Sheets Error: " . $sheetError->getMessage());
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
?>
