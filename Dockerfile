# ── Stage 1: Node build + prod node_modules ───────────────────────────────────
FROM node:20-slim AS node-builder
WORKDIR /build
COPY package*.json ./
# Install all deps for the build, then prune to prod-only for the runtime copy
RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm ci --include=dev
COPY . .
RUN npm run build \
 && npm prune --omit=dev --ignore-scripts
# Outputs: dist/  node_modules/ (prod-only, no sharp, no devDeps)

# ── Stage 2: PHP deps ─────────────────────────────────────────────────────────
FROM composer:2 AS composer-builder
WORKDIR /build
COPY composer.json composer.lock* ./
RUN --mount=type=cache,id=composer,target=/tmp/cache \
    composer install --no-dev --optimize-autoloader --no-scripts

# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
FROM php:8.3-fpm

# Install system deps — nodejs/npm removed; we copy the binary from node-builder
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \
    rm -f /etc/apt/apt.conf.d/docker-clean \
    && apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    cron \
    libzip-dev \
    libpq-dev \
    unzip

# Only the extensions actually used: zip (composer), opcache (perf), pdo_pgsql (DB)
RUN docker-php-ext-install zip opcache pdo_pgsql

# PHP config
RUN echo "upload_max_filesize = 100M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 105M"    >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M"     >> /usr/local/etc/php/conf.d/uploads.ini

# Copy Node runtime from node-builder — avoids apt-installing nodejs/npm (~1-2 min)
COPY --from=node-builder /usr/local/bin/node /usr/local/bin/node
COPY --from=node-builder /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

WORKDIR /app

# Frontend build output
COPY --from=node-builder /build/dist ./dist

# PHP vendor
COPY --from=composer-builder /build/vendor ./vendor

# Prod node_modules (already pruned in node-builder — no second npm ci needed)
COPY --from=node-builder /build/node_modules ./node_modules

# Runtime files
COPY scripts/ ./scripts/
COPY portal-lib/ ./portal-lib/
COPY composer.json ./
RUN mkdir -p /app/Portal

# Empty .env so phpdotenv doesn't throw; Railway injects real env vars
RUN touch /app/.env

# Nginx + startup
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

RUN chown -R www-data:www-data /app

EXPOSE 8080
CMD ["/start.sh"]
