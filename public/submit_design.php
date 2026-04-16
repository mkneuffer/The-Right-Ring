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
$address = $input['address'] ?? '';
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

// ── Turnstile Verification ──
$turnstileToken = $input['turnstileToken'] ?? '';
if (empty($turnstileToken)) {
    echo json_encode(['success' => false, 'message' => 'Human verification required.']);
    exit();
}
$turnstileSecret = $_ENV['TURNSTILE_SECRET_KEY'] ?? '';
$verifyResponse = file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query(['secret' => $turnstileSecret, 'response' => $turnstileToken]),
    ]
]));
$verifyData = json_decode($verifyResponse, true);
if (!($verifyData['success'] ?? false)) {
    echo json_encode(['success' => false, 'message' => 'Verification failed. Please try again.']);
    exit();
}

// ── Brand & Style Variables ──
$brandColor = '#7FB3C9';
$brandDark  = '#5E9BB5';
$brandLight = '#DDF0F7';
$textDark   = '#1a1a2e';
$textMuted  = '#6b7280';
$logoUrl    = 'https://framerusercontent.com/images/FHftFuIChaavuwoII685yqNf6A.png';
$siteUrl    = rtrim($_ENV['SITE_URL'] ?? getenv('SITE_URL') ?: 'https://build.therightring.com', '/');
$portalUrl  = rtrim($_ENV['PORTAL_URL'] ?? getenv('PORTAL_URL') ?: 'https://portal.therightring.com', '/');

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
    $rowBg   = ($rowIndex % 2 === 0) ? '#ffffff' : '#f5fbff';

    // Inline SVG clipart icons for special question types (base64-encoded for email compatibility)
    $clipartBox = function(string $svgInner) use ($brandLight, $brandColor): string {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">'
             . '<rect width="80" height="80" rx="6" fill="' . $brandLight . '"/>'
             . '<g transform="translate(20,20)" stroke="' . $brandColor . '" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
             . $svgInner
             . '</g>'
             . '</svg>';
        return '<img src="data:image/svg+xml;base64,' . base64_encode($svg) . '" width="80" height="80" alt="" style="width:80px;height:80px;display:block;border:0;" />';
    };

    $qid = $selection['questionId'] ?? '';

    // Engraving icon (pen/pencil)
    $engravingPath = '<path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>';
    // Hidden stone icon (gem)
    $hiddenStonePath = '<polygon points="12,2 20,8 17,18 7,18 4,8" stroke-width="1.5"/><polygon points="12,2 20,8 12,6 4,8" fill="' . $brandColor . '" stroke="none" opacity="0.3"/><polygon points="12,6 20,8 17,18 7,18 4,8" fill="' . $brandColor . '" stroke="none" opacity="0.15"/>';
    // Ring size icon (ring/circle)
    $ringSizePath = '<circle cx="12" cy="12" r="9" stroke-width="1.5"/><circle cx="12" cy="12" r="5" stroke-width="1.5"/>';

    $imageHtml = '';
    if ($qid === 'budget') {
        $imageHtml = '';
    } elseif ($qid === 'engravingText') {
        $imageHtml = $clipartBox($engravingPath);
    } elseif (str_starts_with($qid, 'hiddenStone_')) {
        $imageHtml = $clipartBox($hiddenStonePath);
    } elseif ($qid === 'ringSize') {
        $imageHtml = $clipartBox($ringSizePath);
    } elseif (!empty($imageUrl)) {
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
    $mail->Port       = $_ENV['SMTP_PORT'];
    $mail->SMTPSecure = ($mail->Port == 587) ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;

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
    <body style='margin:0;padding:0;background-color:#eaf5fb;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;'>
        <!-- Preheader -->
        <div style='display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#eaf5fb;'>New ring design from {$name} &mdash; {$email} &zwnj;&nbsp;&zwnj;&nbsp;</div>

        <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='background-color:#eaf5fb;'>
            <tr>
                <td align='center' style='padding:40px 16px;'>
                    <!--[if mso]><table width='600' cellpadding='0' cellspacing='0' border='0' align='center'><tr><td><![endif]-->
                    <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;'>

                        <!-- Header -->
                        <tr>
                            <td style='background-color:{$brandDark};padding:28px 30px 20px 30px;text-align:center;'>
                                <img src='{$logoUrl}' alt='The Right Ring' width='160' height='auto' style='display:block;margin:0 auto 8px auto;max-width:160px;height:auto;border:0;' />
                                <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.85);letter-spacing:1.5px;text-transform:uppercase;'>New Design Submission</p>
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
                                            " . ($address ? "<p style='margin:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;'><strong>Shipping Address (ring sizer):</strong> {$address}</p>" : "") . "
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
            ? "Thank you for your payment! Your custom design process has officially begun &mdash; we&rsquo;ll start sourcing stones and working on your 3D model right away. Here&rsquo;s a summary of your beautiful design:"
            : "Thank you for designing your custom ring with us! We&rsquo;re reviewing your selections now and will have a proper estimate ready for you soon. Here&rsquo;s a summary of your beautiful design:";

        if ($paymentMode === 'confirmation_email') {
            $stepsHtml = "
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>1</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>Your Interactive 3D Model is Built</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We&rsquo;ll build you a 3D model based on your selections and your further input so you can visualize how your ring will look and approve it before anything is made.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>2</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>We Source Your Stone</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We&rsquo;ll start looking for the perfect stone based on your selections and budget.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>3</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>You Approve &amp; We Craft It</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>Once you approve the design, our jewelers will bring the ring to life, right here in Rhode Island.</p>
                                                        </td>
                                                    </tr>
                                                </table>";
        } else {
            $stepsHtml = "
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>1</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>We Review Your Design</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We look over your selections, source the right stones, and put together a detailed price estimate tailored to your design.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>2</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>You Receive Your Estimate</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We&rsquo;ll send you a personalized price breakdown and reach out to answer any questions before you commit to anything.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                    <tr>
                                                        <td width='32' valign='top' style='width:32px;'>
                                                            <table cellpadding='0' cellspacing='0' border='0' role='presentation'>
                                                                <tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:bold;line-height:28px;'>3</td></tr>
                                                            </table>
                                                        </td>
                                                        <td valign='top' style='padding-left:12px;'>
                                                            <p style='margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>Start With a $250 Deposit</p>
                                                            <p style='margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>When you&rsquo;re ready to move forward, a $250 design deposit kicks things off. We&rsquo;ll build your interactive 3D model and work with you through every detail until it&rsquo;s exactly right.</p>
                                                            <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;font-style:italic;'>Your deposit simply starts the process &mdash; no design is locked in. We&rsquo;ll work with you through every revision until it&rsquo;s exactly right.</p>
                                                        </td>
                                                    </tr>
                                                </table>";
        }

        $mail->Subject = "Your Custom Ring Design - The Right Ring";
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
        <body style='margin:0;padding:0;background-color:#eaf5fb;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;'>
            <!-- Preheader -->
            <div style='display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#eaf5fb;'>Your custom ring design summary from The Right Ring &zwnj;&nbsp;&zwnj;&nbsp;</div>

            <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='background-color:#eaf5fb;'>
                <tr>
                    <td align='center' style='padding:40px 16px;'>
                        <!--[if mso]><table width='600' cellpadding='0' cellspacing='0' border='0' align='center'><tr><td><![endif]-->
                        <table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;'>

                            <!-- Header -->
                            <tr>
                                <td style='background-color:{$brandDark};padding:28px 30px 20px 30px;text-align:center;'>
                                    <img src='{$logoUrl}' alt='The Right Ring' width='160' height='auto' style='display:block;margin:0 auto 8px auto;max-width:160px;height:auto;border:0;' />
                                    <p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.85);letter-spacing:1.5px;text-transform:uppercase;'>Your Custom Design</p>
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

                                                {$stepsHtml}

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
        } catch (Exception $customerEmailError) {
            error_log("Customer email failed: " . $customerEmailError->getMessage());
        }
    }

    // ── Portal Record Creation ─────────────────────────────────────────────
    // Run BEFORE echoing JSON response so it completes even if client disconnects
    try {
        if (!empty($_ENV['PORTAL_SHEET_ID'])) {
            require_once __DIR__ . '/../portal-lib/store.php';

            $orderId = 'TRR-' . strtoupper(substr(uniqid(), -6));
            $phone4  = substr(preg_replace('/\D/', '', $phone), -4);

            error_log("Portal: creating order $orderId for $email (mode=$paymentMode, phone4=$phone4)");

            $depositAmount = ($paymentMode === 'inquiry') ? 0 : 250;
            $orderOk = createOrder([
                'order_id'          => $orderId,
                'customer_name'     => $name,
                'email'             => $email,
                'phone'             => $phone,
                'address'           => $address,
                'ring_choices_json' => json_encode($selections),
                'total_estimate'    => 0,
                'deposit_paid'      => $depositAmount,
                'amount_paid_total' => $depositAmount,
            ]);

            error_log("Portal: createOrder returned " . ($orderOk ? 'true' : 'false') . " for order $orderId");

            if (!$orderOk) {
                error_log("Portal: createOrder failed for $email — skipping user/invite creation to avoid orphaned records");
            } else {

            $userOk = createUser([
                'email'         => $email,
                'phone_last4'   => $phone4,
                'full_name'     => $name,
                'order_id'      => $orderId,
                'password_hash' => '',
            ]);

            error_log("Portal: createUser returned " . ($userOk ? 'true' : 'false') . " for $email");

            // Upload inspiration photos to portal media
            if (!empty($_FILES['attachments']['name'][0])) {
                require_once __DIR__ . '/../portal-lib/drive.php';
                $fileCount = count($_FILES['attachments']['name']);
                for ($i = 0; $i < $fileCount; $i++) {
                    if ($_FILES['attachments']['error'][$i] === UPLOAD_ERR_OK) {
                        $tmpName  = $_FILES['attachments']['tmp_name'][$i];
                        $origName = basename($_FILES['attachments']['name'][$i]);
                        $mimeType = mime_content_type($tmpName);
                        $mediaId  = uniqid('media_', true);
                        $filename = $mediaId . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $origName);
                        $driveFileId  = '';
                        $thumbnailUrl = '';
                        // Resolve uploads dir: Railway volume (/app/uploads) → EC2 sibling → /tmp
                        $railwayUploadDir = '/app/uploads/';
                        $ec2UploadDir     = __DIR__ . '/../../portal/uploads/';
                        if (is_dir($railwayUploadDir) && is_writable($railwayUploadDir)) {
                            $uploadDir = $railwayUploadDir;
                        } elseif (is_dir($ec2UploadDir) || @mkdir($ec2UploadDir, 0777, true)) {
                            $uploadDir = $ec2UploadDir;
                        } else {
                            $uploadDir = sys_get_temp_dir() . '/';
                        }
                        $localPath = $uploadDir . $filename;
                        if (copy($tmpName, $localPath)) {
                            $thumbnailUrl = strpos($uploadDir, sys_get_temp_dir()) === false
                                ? '/uploads/' . $filename
                                : '';
                        }
                        // Upload to Google Drive regardless of local copy
                        $driveResult = uploadToDrive($tmpName, $filename, $mimeType);
                        if ($driveResult) {
                            $driveFileId  = $driveResult['drive_file_id'];
                            $thumbnailUrl = $driveResult['thumbnail_url'];
                        }
                        addMediaRecord([
                            'media_id'      => $mediaId,
                            'order_id'      => $orderId,
                            'uploader'      => 'customer',
                            'filename'      => $origName,
                            'drive_file_id' => $driveFileId,
                            'thumbnail_url' => $thumbnailUrl,
                            'caption'       => 'Inspiration photo (submitted with design)',
                        ]);
                        error_log("Portal media: uploaded $origName for order $orderId, driveId=$driveFileId");
                    }
                }
            }

            // Send portal invite email
            try {
                $portalMail = new PHPMailer(true);
                $portalMail->isSMTP();
                $portalMail->Host       = $_ENV['SMTP_HOST'];
                $portalMail->SMTPAuth   = true;
                $portalMail->Username   = $_ENV['SMTP_USERNAME'];
                $portalMail->Password   = $_ENV['SMTP_PASSWORD'];
                $portalMail->SMTPSecure = 'tls';
                $portalMail->Port       = (int)$_ENV['SMTP_PORT'];
                $portalMail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
                $portalMail->addAddress($email, $name);
                $portalMail->Subject = 'Your Ring Project Portal Is Ready - The Right Ring';
                $portalMail->isHTML(true);
                $portalMail->Body = "
                <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F7F7F7;padding:32px 24px;border-radius:12px;'>
                  <img src='{$logoUrl}' style='height:44px;margin-bottom:24px;' alt='The Right Ring'>
                  <h2 style='font-size:20px;color:#232429;margin:0 0 12px;'>Your Ring Project Portal Is Ready</h2>
                  <p style='color:#6b7280;font-size:14px;line-height:1.6;margin-bottom:20px;'>
                    Hi {$name}, your custom ring project has been set up in our project portal.<br>
                    You can log in to track progress, view your selections, and make upcoming payments.
                  </p>
                  <table style='width:100%;background:#fff;border-radius:10px;padding:20px;margin-bottom:20px;'>
                    <tr><td style='font-size:13px;color:#6b7280;padding-bottom:4px;'>Login</td>
                        <td style='font-size:14px;font-weight:600;'><a href='{$portalUrl}' style='color:#7FB3C9;'>{$portalUrl}</a></td></tr>
                    <tr><td style='font-size:13px;color:#6b7280;padding-bottom:4px;'>Email</td>
                        <td style='font-size:14px;font-weight:600;'>{$email}</td></tr>
                    <tr><td style='font-size:13px;color:#6b7280;'>First login</td>
                        <td style='font-size:14px;font-weight:600;'>Use your email + last 4 digits of your phone ({$phone4})</td></tr>
                  </table>
                  <a href='{$portalUrl}'
                     style='display:inline-block;background:#A6D1E6;color:#232429;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;'>
                    View My Ring Project
                  </a>
                  <p style='color:#9ca3af;font-size:12px;margin-top:24px;'>The Right Ring Team &nbsp;|&nbsp; <a href='mailto:design@therightring.com' style='color:#A6D1E6;'>design@therightring.com</a></p>
                </div>";
                $portalMail->send();
                error_log("Portal invite email sent to: $email (order: $orderId)");
            } catch (Exception $portalMailErr) {
                error_log("Portal invite email failed: " . $portalMailErr->getMessage());
            }

            } // end if ($orderOk)
        }
    } catch (Exception $portalErr) {
        error_log("Portal record creation error: " . $portalErr->getMessage());
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

    // ── Mailchimp: add subscriber ──────────────────────────────────────────
    if (!empty($email)) {
        $mcApiKey    = $_ENV['MAILCHIMP_API_KEY'] ?? getenv('MAILCHIMP_API_KEY');
        $mcListId    = $_ENV['MAILCHIMP_LIST_ID'] ?? getenv('MAILCHIMP_LIST_ID');
        $mcServer    = $_ENV['MAILCHIMP_SERVER']  ?? getenv('MAILCHIMP_SERVER');
        $nameParts   = explode(' ', trim($name), 2);
        $mcFirstName = $nameParts[0] ?? '';
        $mcLastName  = $nameParts[1] ?? '';
        $mcData = json_encode([
            'email_address' => $email,
            'status'        => 'subscribed',
            'merge_fields'  => [
                'FNAME' => $mcFirstName,
                'LNAME' => $mcLastName,
            ],
        ]);
        $mcCh = curl_init("https://{$mcServer}.api.mailchimp.com/3.0/lists/{$mcListId}/members");
        curl_setopt_array($mcCh, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $mcData,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_USERPWD        => "anystring:{$mcApiKey}",
        ]);
        $mcResponse = curl_exec($mcCh);
        curl_close($mcCh);
        error_log("Mailchimp response: " . $mcResponse);
    }

    // ── Send JSON response ─────────────────────────────────────────────────
    if ($paymentMode === 'confirmation_email') {
        echo json_encode(['success' => true, 'message' => 'Design submitted! Payment required for customer confirmation.', 'debug' => $debugInfo]);
    } else {
        echo json_encode(['success' => true, 'message' => 'Design submitted! Check your email.', 'debug' => $debugInfo]);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
?>
