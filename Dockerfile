ARG PHP_VERSION=8.2
FROM php:${PHP_VERSION}-fpm as php
LABEL maintainer="Jafrul Hossain <jafrultripto@gmail.com>"
ENV TZ=Asia/Dhaka

# Set the timezone
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
    default-mysql-client \
    && docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg \
    && docker-php-ext-install zip pdo_mysql mbstring exif pcntl bcmath opcache gd intl

# Install xdebug only for local environment
ARG DEVELOPMENT=true
RUN if [ "$DEVELOPMENT" = "true" ]; then \
    pecl install xdebug && \
    docker-php-ext-enable xdebug; \
fi

# Copy the application files to the container
COPY --chown=www-data . .

RUN chmod -R 755 /var/www/html/storage
RUN chmod -R 755 /var/www/html/bootstrap

# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Expose port 9000 and start php-fpm server
EXPOSE 9000

# Copy the entrypoint script
COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Give execute permissions to the entrypoint script
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entry point
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["php-fpm"]
