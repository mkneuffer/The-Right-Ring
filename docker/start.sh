#!/bin/bash
set -e

# Decode Google credentials JSON from env var (base64 encoded)
if [ -n "$GOOGLE_CREDENTIALS_JSON" ]; then
    mkdir -p /app/Portal
    echo "$GOOGLE_CREDENTIALS_JSON" | base64 -d > /app/Portal/google-credentials.json
fi

# Pre-create cron log and make it writable by www-data
mkdir -p /var/log
touch /var/log/cron_fetch.log
chown www-data:www-data /var/log/cron_fetch.log
chmod 0664 /var/log/cron_fetch.log

# Nightly diamond sync — fetches from Belgium Diamond API and upserts into Postgres
echo "0 3 * * * www-data cd /app && node scripts/fetch_diamonds.cjs >> /var/log/cron_fetch.log 2>&1" > /etc/cron.d/diamond-fetch
chmod 0644 /etc/cron.d/diamond-fetch
crontab /etc/cron.d/diamond-fetch

# Start cron daemon
service cron start

# Test nginx config before starting
nginx -t

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground (keeps container alive)
exec nginx -g 'daemon off;'
