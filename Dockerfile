# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-slim AS node-builder
WORKDIR /build
# Copy only what's needed for the JS build
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build
# dist/ is now populated with compiled assets + PHP files

# ── Stage 2: PHP deps ─────────────────────────────────────────────────────────
FROM composer:2 AS composer-builder
WORKDIR /build
COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    nginx \
    nodejs \
    npm \
    cron \
    libzip-dev \
    libicu-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install zip intl opcache

# PHP config
RUN echo "upload_max_filesize = 100M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 105M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /app

# Copy built frontend from node-builder (only dist/ — no node_modules)
COPY --from=node-builder /build/dist ./dist

# Copy PHP vendor from composer-builder (only vendor/ — no source)
COPY --from=composer-builder /build/vendor ./vendor

# Copy runtime files needed by PHP (scripts for cron, portal-lib, Portal creds dir)
COPY scripts/ ./scripts/
COPY portal-lib/ ./portal-lib/
COPY composer.json ./
# Portal/google-credentials.json is written at runtime from GOOGLE_CREDENTIALS_JSON env var in start.sh
RUN mkdir -p /app/Portal

# Create empty .env (phpdotenv won't throw; Railway injects real env vars)
RUN touch /app/.env

# Node modules needed only for the cron diamond fetch script
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Nginx + startup
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

RUN chown -R www-data:www-data /app

EXPOSE 8080
CMD ["/start.sh"]
