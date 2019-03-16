# Dockerfile # Mapknitter
# https://github.com/publiclab/mapknitter/

FROM debian:buster
LABEL This image deploys Mapknitter!

# Set correct environment variables.
RUN mkdir -p /app
ENV HOME /root

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
  bundler ruby-rmagick libfreeimage3 \
  libfreeimage-dev zip nodejs gdal-bin \
  curl g++ gcc autoconf automake bison \
  libc6-dev libffi-dev libgdbm-dev \
  libncurses5-dev libsqlite3-dev libtool \
  libyaml-dev make pkg-config sqlite3 \
  zlib1g-dev libgmp-dev libreadline-dev libssl-dev \
  procps libmariadb-dev-compat libmariadb-dev git python-gdal \
  imagemagick

# Ruby
RUN gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB && curl -sSL https://get.rvm.io | bash -s stable && usermod -a -G rvm root
RUN /bin/bash -l -c ". /etc/profile.d/rvm.sh && rvm install 2.4.4 && rvm use 2.4.4 --default"

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y npm
RUN npm install -g bower


# Install bundle of gems
SHELL [ "/bin/bash", "-l", "-c" ]
WORKDIR /tmp
ADD Gemfile /tmp/Gemfile
ADD Gemfile.lock /tmp/Gemfile.lock
RUN bundle install

# HOTFIX Workaround for mysql2 gem incompatibility with libmariadb-dev
RUN sed -i "s/ LONG_PASSWORD |//g" /usr/local/rvm/gems/ruby-*/gems/mysql2-*/lib/mysql2/client.rb

# Add the Rails app
WORKDIR /app
ADD . /app
RUN bower install --allow-root
