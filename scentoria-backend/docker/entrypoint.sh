#!/bin/sh
set -e

cd /var/www/html

# Cache config/routes/views for production performance.
# Safe to re-run on every boot — Laravel overwrites the cache files.
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set RUN_MIGRATIONS=true in your platform's env vars to auto-migrate on deploy.
# Leave unset/false if you prefer running migrations manually.
if [ "$RUN_MIGRATIONS" = "true" ]; then
    php artisan migrate --force
fi
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf