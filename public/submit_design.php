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

// Brand colors
$brandColor = '#8B7355';
$brandDark = '#6B5745';
// Brand colors
$brandColor = '#8B7355';
$brandDark = '#6B5745';
$siteUrl = rtrim($_ENV['SITE_URL'] ?? $_SERVER['SITE_URL'] ?? getenv('SITE_URL') ?? 'https://therightring.com', '/');

// Debug info
$debugInfo = [
    'env_site_url' => $_ENV['SITE_URL'] ?? 'NOT SET',
    'server_site_url' => $_SERVER['SITE_URL'] ?? 'NOT SET',
    'getenv_site_url' => getenv('SITE_URL'),
    'resolved_siteUrl' => $siteUrl
];

// Build HTML for selections
$selectionsHtml = '';
foreach ($selections as $selection) {
    $selectionName = htmlspecialchars($selection['name'] ?? '');
    $questionText = htmlspecialchars($selection['questionText'] ?? '');
    $imageUrl = htmlspecialchars($selection['imageUrl'] ?? '');
    
    // URL Encode the path components to handle spaces and special chars like []
    if (!empty($imageUrl) && strpos($imageUrl, 'http') !== 0) {
        $pathParts = explode('/', ltrim($imageUrl, '/'));
        $encodedParts = array_map('rawurlencode', $pathParts);
        $imageUrl = $siteUrl . '/' . implode('/', $encodedParts);
    }
    
    // Add to debug info
    $debugInfo['images'][] = [
        'original' => $selection['imageUrl'] ?? '',
        'final' => $imageUrl
    ];

    $details = htmlspecialchars($selection['details'] ?? '');
    
    // Check if this is the budget question to render icon instead of image
    $imageHtml = '';
    if (isset($selection['questionId']) && $selection['questionId'] === 'budget') {
        // No image or icon for budget as requested
        $imageHtml = "";
    } else {
        $imageHtml = "<img src='{$imageUrl}' alt='{$selectionName}' style='width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;' />";
    }
    
    $selectionsHtml .= "
        <tr>
            <td style='padding: 20px; border-bottom: 1px solid #e5e7eb;'>
                <table width='100%' cellpadding='0' cellspacing='0'>
                    <tr>
                        <td width='100' style='padding-right: 20px;'>
                            {$imageHtml}
                        </td>
                        <td style='vertical-align: top;'>
                            <p style='margin: 0 0 5px 0; font-size: 12px; color: #6b7280; font-weight: 600;'>{$questionText}</p>
                            <p style='margin: 0 0 5px 0; font-size: 16px; color: #111827; font-weight: bold;'>{$selectionName}</p>
                            " . ($details ? "<p style='margin: 0; font-size: 12px; color: #6b7280;'>{$details}</p>" : "") . "
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    ";
}

// Admin-specific content (with diamond link)
$adminDiamondInfo = '';
foreach ($selections as $selection) {
    if (isset($selection['diamondData'])) {
        $diamond = $selection['diamondData'];
        $stockNo = htmlspecialchars($diamond['stockNo'] ?? '');
        $videoLink = htmlspecialchars($diamond['videoLink'] ?? '');
        $certLink = htmlspecialchars($diamond['certificateLink'] ?? '');
        
        $adminDiamondInfo = "
            <tr>
                <td style='padding: 20px; background-color: #fef3c7; border-radius: 8px;'>
                    <h3 style='margin: 0 0 10px 0; color: #92400e; font-size: 16px;'>Diamond Details</h3>
                    <p style='margin: 5px 0; color: #78350f;'><strong>Stock #:</strong> {$stockNo}</p>
                    " . ($videoLink ? "<p style='margin: 5px 0;'><a href='{$videoLink}' style='color: {$brandColor}; text-decoration: none;'>View Video</a></p>" : "") . "
                    " . ($certLink ? "<p style='margin: 5px 0;'><a href='{$certLink}' style='color: {$brandColor}; text-decoration: none;'>View Certificate</a></p>" : "") . "
                </td>
            </tr>
        ";
    }
}

$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->isSMTP();                                            
    $mail->Host       = $_ENV['SMTP_HOST'];                     
    $mail->SMTPAuth   = true;                                   
    $mail->Username   = $_ENV['SMTP_USERNAME'];                     
    $mail->Password   = $_ENV['SMTP_PASSWORD'];                               
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            
    $mail->Port       = $_ENV['SMTP_PORT'];                                    

    // --- Email to Admin ---
    $mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
    $mail->addAddress('design@therightring.com');     

    // Handle Attachments
    if (isset($_FILES['attachments'])) {
        $fileCount = count($_FILES['attachments']['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['attachments']['error'][$i] === UPLOAD_ERR_OK) {
                $tmpName = $_FILES['attachments']['tmp_name'][$i];
                $name = $_FILES['attachments']['name'][$i];
                // Attach the file to the email
                $mail->addAttachment($tmpName, $name);
            }
        }
    }

    $mail->isHTML(true);                                  
    $mail->Subject = "New Ring Design Submission from $name";
    $mail->Body    = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    </head>
    <body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; background-color: #f7f7f7;'>
        <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f7f7f7; padding: 40px 20px;'>
            <tr>
                <td align='center'>
                    <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                        <tr>
                            <td style='background: linear-gradient(135deg, {$brandColor} 0%, {$brandDark} 100%); padding: 40px; text-align: center;'>
                                <h1 style='margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;'>New Design Submission</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style='padding: 30px;'>
                                <h2 style='margin: 0 0 20px 0; color: #111827; font-size: 20px;'>Customer Information</h2>
                                <p style='margin: 5px 0; color: #374151;'><strong>Name:</strong> {$name}</p>
                                <p style='margin: 5px 0; color: #374151;'><strong>Email:</strong> {$email}</p>
                                <p style='margin: 5px 0; color: #374151;'><strong>Phone:</strong> {$phone}</p>
                                " . ($info ? "<p style='margin: 15px 0 0 0; color: #374151;'><strong>Additional Info:</strong><br/>{$info}</p>" : "") . "
                            </td>
                        </tr>
                        {$adminDiamondInfo}
                        <tr>
                            <td style='padding: 30px;'>
                                <h2 style='margin: 0 0 20px 0; color: #111827; font-size: 20px;'>Design Configuration</h2>
                                <table width='100%' cellpadding='0' cellspacing='0' style='border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;'>
                                    {$selectionsHtml}
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style='padding: 30px; text-align: center; background-color: #f9fafb;'>
                                <p style='margin: 0; color: #6b7280; font-size: 12px;'>The Right Ring - Custom Engagement Ring Builder</p>
                            </td>
                        </tr>
                    </table>
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
    // - If 'inquiry': Send immediately.
    // - If 'deposit': SKIP (will be sent after payment success).
    // - If 'confirmation_email': Send (this IS the post-payment trigger).
    
    $shouldSendCustomerEmail = ($paymentMode === 'inquiry' || $paymentMode === 'confirmation_email');

    if ($shouldSendCustomerEmail) {
        $mail->clearAddresses();
        $mail->addAddress($email, $name);

        $mail->Subject = "Your Custom Ring Design - The Right Ring";
        $mail->Body    = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        </head>
        <body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; background-color: #f7f7f7;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f7f7f7; padding: 40px 20px;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                            <tr>
                                <td style='background: linear-gradient(135deg, {$brandColor} 0%, {$brandDark} 100%); padding: 40px; text-align: center;'>
                                    <h1 style='margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;'>Your Right Ring</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 30px;'>
                                    <h2 style='margin: 0 0 10px 0; color: #111827; font-size: 24px;'>Hi {$name},</h2>
                                    <p style='margin: 0 0 20px 0; color: #374151; line-height: 1.6;'>
                                        " . ($paymentMode === 'confirmation_email' ? "Thank you for your payment! Your custom design process has officially begun." : "Thank you for designing your custom ring with us! Here is a summary of your beautiful design:") . "
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 0 30px 30px 30px;'>
                                    <table width='100%' cellpadding='0' cellspacing='0' style='border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;'>
                                        {$selectionsHtml}
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 30px; background-color: #fef3c7; text-align: center;'>
                                    <p style='margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: bold;'>What's Next?</p>
                                    <p style='margin: 0; color: #78350f; line-height: 1.6;'>We will review your design and get back to you shortly with pricing and next steps.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 30px; text-align: center;'>
                                    <p style='margin: 0 0 10px 0; color: #111827; font-size: 16px;'>Best regards,<br/><strong>The Right Ring Team</strong></p>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 20px 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;'>
                                    <p style='margin: 0; color: #6b7280; font-size: 12px;'>The Right Ring - Custom Engagement Ring Builder</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";

        try {
            $mail->send();
            error_log("Customer email sent successfully to: $email");
            echo json_encode(['success' => true, 'message' => 'Design submitted successfully!', 'debug' => $debugInfo]);
        } catch (Exception $customerEmailError) {
            error_log("Customer email failed: " . $customerEmailError->getMessage());
            echo json_encode(['success' => true, 'message' => 'Design submitted! Admin notified but customer confirmation email failed.', 'debug' => $debugInfo]);
        }
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
                
                // Format selections into a single string for the sheet
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
