<?php
require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use PHPMailer\PHPMailer\PHPMailer;

function makeMailer(): PHPMailer {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USERNAME'];
    $mail->Password   = $_ENV['SMTP_PASSWORD'];
    $mail->SMTPSecure = 'tls';
    $mail->Port       = (int)$_ENV['SMTP_PORT'];
    $mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
    $mail->addAddress('design@therightring.com', 'The Right Ring');
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    return $mail;
}

$to      = 'design@therightring.com';
$results = [];

// ─── Shared sample data ───────────────────────────────────────────────────────
$brandDark  = '#2D5F8A';
$brandColor = '#4A7EB8';
$brandLight = '#EAF5FB';
$textDark   = '#232429';
$textMuted  = '#6B7280';
$logoUrl    = 'https://framerusercontent.com/images/FHftFuIChaavuwoII685yqNf6A.png';
$siteUrl    = 'https://therightring.com';
$name       = 'Jane Smith';

$selectionsHtml = "
<tr style='background:#f8fafc;'><td style='padding:10px 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;' colspan='2'>Your Design</td></tr>
<tr><td style='padding:10px 16px;font-size:14px;color:#374151;border-top:1px solid #e5e7eb;'>Base Ring</td><td style='padding:10px 16px;font-size:14px;color:#232429;font-weight:600;border-top:1px solid #e5e7eb;'>Wright Style</td></tr>
<tr><td style='padding:10px 16px;font-size:14px;color:#374151;border-top:1px solid #e5e7eb;'>Stone Shape</td><td style='padding:10px 16px;font-size:14px;color:#232429;font-weight:600;border-top:1px solid #e5e7eb;'>Oval</td></tr>
<tr><td style='padding:10px 16px;font-size:14px;color:#374151;border-top:1px solid #e5e7eb;'>Metal Type</td><td style='padding:10px 16px;font-size:14px;color:#232429;font-weight:600;border-top:1px solid #e5e7eb;'>14K White Gold</td></tr>
<tr><td style='padding:10px 16px;font-size:14px;color:#374151;border-top:1px solid #e5e7eb;'>Diamond</td><td style='padding:10px 16px;font-size:14px;color:#232429;font-weight:600;border-top:1px solid #e5e7eb;'>1.52 ct Oval — G/VS1 — $8,450</td></tr>
";

$whatNextHtml = "
<p style='margin:0 0 16px 0;font-family:Georgia,Times,serif;font-size:18px;color:{$textDark};font-weight:bold;'>What Happens Next?</p>
<table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
  <tr>
    <td width='32' valign='top'><table cellpadding='0' cellspacing='0' border='0'><tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#fff;font-weight:bold;line-height:28px;'>1</td></tr></table></td>
    <td valign='top' style='padding-left:12px;'><p style='margin:0 0 2px;font-family:Arial,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>We Review Your Design</p><p style='margin:0;font-family:Arial,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We look over your selections, source the right stones, and put together a detailed price estimate tailored to your design.</p></td>
  </tr>
</table>
<table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
  <tr>
    <td width='32' valign='top'><table cellpadding='0' cellspacing='0' border='0'><tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#fff;font-weight:bold;line-height:28px;'>2</td></tr></table></td>
    <td valign='top' style='padding-left:12px;'><p style='margin:0 0 2px;font-family:Arial,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>You Receive Your Estimate</p><p style='margin:0;font-family:Arial,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We&rsquo;ll send you a personalized price breakdown and reach out to answer any questions before you commit to anything.</p></td>
  </tr>
</table>
<table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation'>
  <tr>
    <td width='32' valign='top'><table cellpadding='0' cellspacing='0' border='0'><tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#fff;font-weight:bold;line-height:28px;'>3</td></tr></table></td>
    <td valign='top' style='padding-left:12px;'><p style='margin:0 0 2px;font-family:Arial,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>Start With a $250 Deposit</p><p style='margin:0 0 6px;font-family:Arial,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>When you&rsquo;re ready to move forward, a $250 design deposit kicks things off. We&rsquo;ll build your interactive 3D model and work with you through every detail until it&rsquo;s exactly right.</p><p style='margin:0;font-family:Arial,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;font-style:italic;'>Your deposit simply starts the process &mdash; no design is locked in. We&rsquo;ll work with you through every revision until it&rsquo;s exactly right.</p></td>
  </tr>
</table>
";

function emailBody(string $greetingText, string $selectionsHtml, string $whatNextHtml, string $brandDark, string $brandColor, string $brandLight, string $textDark, string $textMuted, string $logoUrl, string $siteUrl, string $name): string {
    return "<!DOCTYPE html><html xmlns='http://www.w3.org/1999/xhtml'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'></head>
    <body style='margin:0;padding:0;background-color:#eaf5fb;'>
    <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#eaf5fb;'>
      <tr><td align='center' style='padding:40px 16px;'>
        <table width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;'>
          <tr><td style='background-color:{$brandDark};padding:28px 30px 20px;text-align:center;'>
            <img src='{$logoUrl}' alt='The Right Ring' width='160' style='display:block;margin:0 auto 8px;border:0;' />
            <p style='margin:0;font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.85);letter-spacing:1.5px;text-transform:uppercase;'>Your Custom Design</p>
          </td></tr>
          <tr><td style='padding:30px 30px 16px;'>
            <p style='margin:0 0 8px;font-family:Georgia,Times,serif;font-size:22px;color:{$textDark};'>Hi {$name},</p>
            <p style='margin:0;font-family:Arial,sans-serif;font-size:15px;color:#374151;line-height:1.6;'>{$greetingText}</p>
          </td></tr>
          <tr><td style='padding:20px 30px 30px;'>
            <table width='100%' cellpadding='0' cellspacing='0' border='0' style='border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;'>
              {$selectionsHtml}
            </table>
          </td></tr>
          <tr><td style='padding:0 30px 30px;'>
            <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:{$brandLight};border-radius:8px;'>
              <tr><td style='padding:24px;'>{$whatNextHtml}</td></tr>
            </table>
          </td></tr>
          <tr><td style='padding:0 30px 30px;text-align:center;'>
            <p style='margin:0 0 8px;font-family:Arial,sans-serif;font-size:15px;color:{$textDark};'>Best regards,</p>
            <p style='margin:0;font-family:Georgia,Times,serif;font-size:16px;color:{$brandDark};font-weight:bold;'>The Right Ring Team</p>
          </td></tr>
          <tr><td style='padding:24px 30px;text-align:center;background-color:#f9fafb;border-top:1px solid #e5e7eb;'>
            <p style='margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:{$textMuted};'><a href='mailto:design@therightring.com' style='color:{$brandColor};text-decoration:none;'>design@therightring.com</a></p>
            <p style='margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;color:{$textMuted};'><a href='{$siteUrl}' style='color:{$brandColor};text-decoration:none;'>therightring.com</a></p>
            <p style='margin:0;font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;'>The Right Ring &mdash; Custom Engagement Ring Builder</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    </body></html>";
}

// ─── Email 1a: Inquiry (no deposit) ──────────────────────────────────────────
try {
    $mail = makeMailer();
    $mail->Subject = '[TEST] Email 1a — Inquiry (no deposit paid)';
    $greetingText = "Thank you for designing your custom ring with us! We&rsquo;re reviewing your selections now and will have a proper estimate ready for you soon. Here&rsquo;s a summary of your beautiful design:";
    $mail->Body = emailBody($greetingText, $selectionsHtml, $whatNextHtml, $brandDark, $brandColor, $brandLight, $textDark, $textMuted, $logoUrl, $siteUrl, $name);
    $mail->send();
    $results[] = '✓ Email 1a sent (Inquiry)';
} catch (Exception $e) {
    $results[] = '✗ Email 1a failed: ' . $e->getMessage();
}

// ─── Email 1b: Post-deposit confirmation ─────────────────────────────────────
try {
    $mail = makeMailer();
    $mail->Subject = '[TEST] Email 1b — Post-deposit confirmation';
    $greetingText = "Thank you for your payment! Your custom design process has officially begun &mdash; we&rsquo;ll start sourcing stones and working on your 3D model right away. Here&rsquo;s a summary of your beautiful design:";
    $postDepositStepsHtml = "
<p style='margin:0 0 16px 0;font-family:Georgia,Times,serif;font-size:18px;color:{$textDark};font-weight:bold;'>What Happens Next?</p>
<table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
  <tr>
    <td width='32' valign='top'><table cellpadding='0' cellspacing='0' border='0'><tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#fff;font-weight:bold;line-height:28px;'>1</td></tr></table></td>
    <td valign='top' style='padding-left:12px;'><p style='margin:0 0 2px;font-family:Arial,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>Your Interactive 3D Model is Built</p><p style='margin:0;font-family:Arial,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We&rsquo;ll build you a 3D model based on your selections and your further input so you can visualize how your ring will look and approve it before anything is made.</p></td>
  </tr>
</table>
<table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin-bottom:12px;'>
  <tr>
    <td width='32' valign='top'><table cellpadding='0' cellspacing='0' border='0'><tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#fff;font-weight:bold;line-height:28px;'>2</td></tr></table></td>
    <td valign='top' style='padding-left:12px;'><p style='margin:0 0 2px;font-family:Arial,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>We Source Your Stone</p><p style='margin:0;font-family:Arial,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>We&rsquo;ll start looking for the perfect stone based on your selections and budget.</p></td>
  </tr>
</table>
<table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation'>
  <tr>
    <td width='32' valign='top'><table cellpadding='0' cellspacing='0' border='0'><tr><td style='width:28px;height:28px;background-color:{$brandColor};border-radius:50%;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#fff;font-weight:bold;line-height:28px;'>3</td></tr></table></td>
    <td valign='top' style='padding-left:12px;'><p style='margin:0 0 2px;font-family:Arial,sans-serif;font-size:14px;color:{$textDark};font-weight:bold;'>You Approve &amp; We Craft It</p><p style='margin:0;font-family:Arial,sans-serif;font-size:13px;color:{$textMuted};line-height:1.5;'>Once you approve the design, our jewelers will bring the ring to life, right here in Rhode Island.</p></td>
  </tr>
</table>
";
    $mail->Body = emailBody($greetingText, $selectionsHtml, $postDepositStepsHtml, $brandDark, $brandColor, $brandLight, $textDark, $textMuted, $logoUrl, $siteUrl, $name);
    $mail->send();
    $results[] = '✓ Email 1b sent (Post-deposit)';
} catch (Exception $e) {
    $results[] = '✗ Email 1b failed: ' . $e->getMessage();
}

// ─── Email 2a: Estimate — deposit NOT yet paid ────────────────────────────────
try {
    $mail = makeMailer();
    $mail->Subject = '[TEST] Email 2a — Estimate (deposit not paid)';
    $magicLink = 'https://portal.therightring.com';
    $totalFmt  = '$12,650';
    $lineRows  = "
      <tr><td style='padding:11px 0;font-size:15px;color:#374151;border-bottom:1px solid #f0f2f5;'>Ring Setting (Wright Style)</td><td style='padding:11px 0;font-size:15px;color:#232429;font-weight:600;text-align:right;border-bottom:1px solid #f0f2f5;'>\$2,300</td></tr>
      <tr><td style='padding:11px 0;font-size:15px;color:#374151;border-bottom:1px solid #f0f2f5;'>1.52ct Oval Diamond G/VS1</td><td style='padding:11px 0;font-size:15px;color:#232429;font-weight:600;text-align:right;border-bottom:1px solid #f0f2f5;'>\$8,450</td></tr>
      <tr><td style='padding:11px 0;font-size:15px;color:#374151;'>Labor &amp; Finishing</td><td style='padding:11px 0;font-size:15px;color:#232429;font-weight:600;text-align:right;'>\$1,900</td></tr>
    ";
    $depositSection = '<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.7;">One thing I want to mention &#8212; we would love to create an interactive 3D model of your ring before we build it. It truly makes a difference in seeing exactly how your ring will look, and most of our customers find it really helpful to be able to rotate and zoom in on every detail before giving final approval.</p>
    <p style="margin:0 0 10px;font-size:14px;color:#374151;line-height:1.7;">Because it does take us time and craftsmanship to produce, a $250 design deposit is required to get started. Once that is in, we get to work right away.</p>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;"><em>Your deposit simply starts the process &mdash; no design is locked in. We\'ll work with you through every revision until it\'s exactly right.</em></p>';
    $mail->Body = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr><td style="background:#2D5F8A;padding:28px 36px;"><img src="' . $logoUrl . '" alt="The Right Ring" width="160" style="display:block;width:160px;border:0;"></td></tr>
  <tr><td style="padding:36px 36px 0;">
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#1a2e3b;">Your Custom Ring Estimate</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">Hi Jane,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">Thank you so much for designing your ring with us. It was a pleasure putting this together for you, and I am really excited about how this is going to turn out.</p>
    <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">Below is your personalized price estimate based on your selections.</p>
  </td></tr>
  <tr><td style="padding:0 36px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <tr><td colspan="2" style="background:#f8fafc;padding:12px 20px;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Price Breakdown</td></tr>
      <tr><td colspan="2" style="padding:4px 20px 0;"><table width="100%" cellpadding="0" cellspacing="0">' . $lineRows . '
        <tr><td style="padding:16px 0 12px;font-size:16px;font-weight:700;color:#1a2e3b;">Estimated Total</td><td style="padding:16px 0 12px;font-size:22px;font-weight:800;color:#2D5F8A;text-align:right;">' . $totalFmt . '</td></tr>
      </table></td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:28px 36px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#1E40AF;">Interactive 3D Ring Preview</p>
        ' . $depositSection . '
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:28px 36px 0;text-align:center;">
    <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.7;">Ready to move forward? Click below to log in to your personal project portal.</p>
    <a href="' . $magicLink . '" style="display:inline-block;background:#2D5F8A;color:#ffffff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">View My Estimate &amp; Get Started</a>
  </td></tr>
  <tr><td style="padding:32px 36px 36px;">
    <p style="margin:0 0 4px;font-size:15px;color:#4b5563;line-height:1.7;">Looking forward to creating something truly special for you,</p>
    <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1a2e3b;">Matt</p>
    <p style="margin:0;font-size:14px;color:#6b7280;">The Right Ring &nbsp;|&nbsp; <a href="mailto:design@therightring.com" style="color:#2D5F8A;text-decoration:none;">design@therightring.com</a></p>
  </td></tr>
  <tr><td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">You received this because you requested a custom ring estimate from The Right Ring.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>';
    $mail->send();
    $results[] = '✓ Email 2a sent (Estimate — deposit not paid)';
} catch (Exception $e) {
    $results[] = '✗ Email 2a failed: ' . $e->getMessage();
}

// ─── Email 2b: Estimate — deposit already paid ───────────────────────────────
try {
    $mail = makeMailer();
    $mail->Subject = '[TEST] Email 2b — Estimate (deposit already paid)';
    $magicLink = 'https://portal.therightring.com';
    $totalFmt  = '$12,650';
    $lineRows  = "
      <tr><td style='padding:11px 0;font-size:15px;color:#374151;border-bottom:1px solid #f0f2f5;'>Ring Setting (Wright Style)</td><td style='padding:11px 0;font-size:15px;color:#232429;font-weight:600;text-align:right;border-bottom:1px solid #f0f2f5;'>\$2,300</td></tr>
      <tr><td style='padding:11px 0;font-size:15px;color:#374151;border-bottom:1px solid #f0f2f5;'>1.52ct Oval Diamond G/VS1</td><td style='padding:11px 0;font-size:15px;color:#232429;font-weight:600;text-align:right;border-bottom:1px solid #f0f2f5;'>\$8,450</td></tr>
      <tr><td style='padding:11px 0;font-size:15px;color:#374151;'>Labor &amp; Finishing</td><td style='padding:11px 0;font-size:15px;color:#232429;font-weight:600;text-align:right;'>\$1,900</td></tr>
    ";
    $mail->Body = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr><td style="background:#2D5F8A;padding:28px 36px;"><img src="' . $logoUrl . '" alt="The Right Ring" width="160" style="display:block;width:160px;border:0;"></td></tr>
  <tr><td style="padding:36px 36px 0;">
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#1a2e3b;">Your Custom Ring Estimate</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">Hi Jane,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">Your deposit is in and we\'re already getting to work &mdash; I wanted to make sure you have your full price breakdown in one place for your records.</p>
    <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">Below is your personalized price estimate based on your selections. The final price may vary slightly depending on the exact stone and metal details we finalize together.</p>
  </td></tr>
  <tr><td style="padding:0 36px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <tr><td colspan="2" style="background:#f8fafc;padding:12px 20px;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Price Breakdown</td></tr>
      <tr><td colspan="2" style="padding:4px 20px 0;"><table width="100%" cellpadding="0" cellspacing="0">' . $lineRows . '
        <tr><td style="padding:16px 0 12px;font-size:16px;font-weight:700;color:#1a2e3b;">Estimated Total</td><td style="padding:16px 0 12px;font-size:22px;font-weight:800;color:#2D5F8A;text-align:right;">' . $totalFmt . '</td></tr>
      </table></td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:28px 36px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#1E40AF;">Interactive 3D Ring Preview</p>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.7;">We would love to create an interactive 3D model of your ring before we build it. It truly makes a difference in seeing exactly how your ring will look.</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">Your deposit is in and we\'re getting started. We\'ll be in touch shortly to begin sourcing stones and working on your 3D model.</p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:28px 36px 0;text-align:center;">
    <a href="' . $magicLink . '" style="display:inline-block;background:#2D5F8A;color:#ffffff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">View My Portal</a>
  </td></tr>
  <tr><td style="padding:32px 36px 36px;">
    <p style="margin:0 0 4px;font-size:15px;color:#4b5563;">Looking forward to creating something truly special for you,</p>
    <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1a2e3b;">Matt</p>
    <p style="margin:0;font-size:14px;color:#6b7280;">The Right Ring &nbsp;|&nbsp; <a href="mailto:design@therightring.com" style="color:#2D5F8A;text-decoration:none;">design@therightring.com</a></p>
  </td></tr>
  <tr><td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">You received this because you requested a custom ring estimate from The Right Ring.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>';
    $mail->send();
    $results[] = '✓ Email 2b sent (Estimate — deposit already paid)';
} catch (Exception $e) {
    $results[] = '✗ Email 2b failed: ' . $e->getMessage();
}

// ─── Output ───────────────────────────────────────────────────────────────────
echo implode("\n", $results) . "\n";
