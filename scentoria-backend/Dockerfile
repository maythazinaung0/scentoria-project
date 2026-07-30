# syntax=docker/dockerfile:1

# ---- Stage 1: compile the COBOL batch binary -------------------------------
FROM ubuntu:24.04 AS cobol-build
RUN apt-get update && apt-get install -y --no-install-recommends gnucobol3 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY cobol/SALESBATCH.cob .
RUN cobc -x -o sales_batch SALESBATCH.cob

# ---- Stage 2: install PHP dependencies --------------------------------------
FROM composer:2 AS composer-build
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --no-dev

# ---- Stage 3: build frontend assets (Vite/Blade assets, if any) -------------
FROM node:24-slim AS node-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 4: production runtime --------------------------------------------
FROM ubuntu:24.04

ARG PHP_VERSION=8.3
ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC \
    LANG=C.UTF-8

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
        gnupg curl ca-certificates \
    && mkdir -p /etc/apt/keyrings \
    && curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x4F4EA0AAE5267A6C' \
        | gpg --dearmor -o /etc/apt/keyrings/ppa_ondrej_php.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble main" \
        > /etc/apt/sources.list.d/php.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx supervisor \
        php${PHP_VERSION}-fpm php${PHP_VERSION}-cli \
        php${PHP_VERSION}-mysql php${PHP_VERSION}-pgsql \
        php${PHP_VERSION}-mbstring php${PHP_VERSION}-xml php${PHP_VERSION}-curl \
        php${PHP_VERSION}-zip php${PHP_VERSION}-bcmath php${PHP_VERSION}-intl \
        php${PHP_VERSION}-redis php${PHP_VERSION}-gd \
    && apt-get purge -y gnupg curl \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# App code + built vendor/ from the composer stage
COPY --from=composer-build /app /var/www/html
# Compiled frontend assets
COPY --from=node-build /app/public/build /var/www/html/public/build
# Compiled COBOL binary — no compiler needed at runtime
COPY --from=cobol-build /build/sales_batch /var/www/html/cobol/bin/sales_batch

RUN mkdir -p storage/app/cobol/input storage/app/cobol/output \
             storage/framework/{cache,sessions,views} storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x cobol/bin/sales_batch

COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80
ENTRYPOINT ["entrypoint.sh"]