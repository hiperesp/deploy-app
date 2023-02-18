FROM composer:2.4 AS composer
WORKDIR /app
COPY src/composer.json .
COPY src/composer.lock .
RUN composer install --no-interaction --no-dev --no-scripts --no-plugins --optimize-autoloader

FROM php:8.2.3-apache AS base
RUN apt update \
    && apt install -y libssh2-1-dev libssh2-1 \
    && pecl install ssh2-1.3.1 \
    && docker-php-ext-enable ssh2
RUN a2enmod rewrite
WORKDIR /var/www/html
COPY src/ .
COPY --from=composer /app/vendor/ /var/www/html/vendor/

EXPOSE 80