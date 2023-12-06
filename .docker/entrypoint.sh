#!/bin/bash
echo "Checking for vendor/autoload.php file..."
if [ ! -f "vendor/autoload.php" ]; then
    echo "Running composer install..."
    composer install --no-progress --no-interaction
else
    echo "Running composer update..."
    composer update --no-progress --no-interaction
fi

echo "Checking for .env file..."
if [ ! -f ".env" ]; then
    echo "Creating env file for env $APP_ENV"
    cp .env.example .env
else
    echo "env file exists."
fi
php artisan migrate

exec "$@"
