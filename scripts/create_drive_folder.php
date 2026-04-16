<?php
/**
 * One-time script: creates the Portal Media folder in Google Drive
 * under the service account and prints the folder ID to paste into .env
 *
 * Run with: php scripts/create_drive_folder.php
 */

require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$credPath = __DIR__ . '/../Portal/google-credentials.json';

$client = new \Google_Client();
$client->setApplicationName('The Right Ring Portal Setup');
$client->setScopes([\Google_Service_Drive::DRIVE_FILE]);
$client->setAuthConfig($credPath);
$client->setAccessType('offline');

$drive = new \Google_Service_Drive($client);

$meta = new \Google_Service_Drive_DriveFile([
    'name'     => 'TheRightRing Portal Media',
    'mimeType' => 'application/vnd.google-apps.folder',
]);

$folder = $drive->files->create($meta, ['fields' => 'id,name,webViewLink']);

echo "✅ Folder created!\n";
echo "   Name: " . $folder->getName() . "\n";
echo "   ID:   " . $folder->getId() . "\n";
echo "   URL:  " . $folder->getWebViewLink() . "\n\n";
echo "Add this to your .env file:\n";
echo "PORTAL_DRIVE_FOLDER_ID=" . $folder->getId() . "\n";
