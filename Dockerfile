# Dockerfile # Mapknitter
# https://github.com/publiclab/mapknitter/

FROM ruby:2.4.4-stretch
MAINTAINER Sebastian Silva "sebastian@fuentelibre.org"

LABEL This image deploys Mapknitter!

# Set correct environment variables.
RUN mkdir -p /app
ENV HOME /root

# Install dependencies
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get update -qq && apt-get install -y bundler default-libmysqlclient-dev ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip nodejs ##ALSO TRIED: ruby-pg
RUN npm install -g bower

# Install bundle of gems
WORKDIR /tmp
ADD Gemfile /tmp/Gemfile
ADD Gemfile.lock /tmp/Gemfile.lock
RUN bundle install

# Add the Rails app
WORKDIR /app
ADD . /app
RUN bower install --allow-root
