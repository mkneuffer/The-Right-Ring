FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    nodejs \
    npm \
    unzip \
    curl \
    git \
    cron \
    libzip-dev \
    libicu-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install zip intl opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy entire project
COPY . .

# Install Node deps and build frontend (vite build + copies PHP files into dist/)
RUN npm ci
RUN npm run build

# Install PHP Composer deps
RUN composer install --no-dev --optimize-autoloader

# Create empty .env so phpdotenv doesn't throw (Railway injects real env vars at runtime)
RUN touch /app/.env

# PHP upload and runtime config
RUN echo "upload_max_filesize = 100M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 105M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

# Fix permissions
RUN chown -R www-data:www-data /app

# Nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]
