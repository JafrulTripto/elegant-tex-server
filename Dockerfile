FROM php:8.2-fpm as php
LABEL maintainer="Jafrul Hossain <jafrultripto@gmail.com>"
# Create a new user

RUN usermod -u 1000 www-data

# Set the working directory
WORKDIR /var/www/html

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libonig-dev \
    libicu-dev \
    libzip-dev zip \
    unzip \
    libcurl4-gnutls-dev \
    curl \
    && docker-php-ext-install zip pdo_mysql mbstring exif pcntl bcmath opcache gd intl

# Copy the application files to the container
COPY --chown=www-data . .

RUN php artisan cache:clear
RUN php artisan config:clear



RUN chmod -R 755 /var/www/html/storage
RUN chmod -R 755 /var/www/html/bootstrap
# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer


# Expose port 9000 and start php-fpm server
EXPOSE 9000
ENTRYPOINT [".docker/entrypoint.sh"]

CMD ["php-fpm"]


