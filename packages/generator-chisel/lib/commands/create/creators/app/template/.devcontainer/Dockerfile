ARG BASE_IMAGE_VERSION
FROM wordpress:${BASE_IMAGE_VERSION}

ARG CHISEL_PORT=3000

# Install MariaDB Client
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends mariadb-client

# Install WP CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
 && chmod +x wp-cli.phar \
 && mv wp-cli.phar /usr/local/bin/wp

# Update port
RUN sed -i 's/80/${CHISEL_PORT}/' /etc/apache2/ports.conf

# Use wordpress user to run apache
ENV APACHE_RUN_USER wordpress
ENV APACHE_RUN_GROUP wordpress
ENV CHISEL_PORT=${CHISEL_PORT}
