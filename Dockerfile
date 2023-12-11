ARG PHP_VERSION=8.2
FROM php:${PHP_VERSION}-fpm as php
LABEL maintainer="Jafrul Hossain <jafrultripto@gmail.com>"
ENV TZ=Asia/Dhaka
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
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

RUN chmod -R 755 /var/www/html/storage
RUN chmod -R 755 /var/www/html/bootstrap
# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer


# Expose port 9000 and start php-fpm server
EXPOSE 9000

RUN chmod +x entrypoint.sh
ENTRYPOINT [".docker/entrypoint.sh"]

CMD ["php-fpm"]


