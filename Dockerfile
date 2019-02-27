# Dockerfile # Mapknitter
# https://github.com/publiclab/mapknitter/
# This image deploys Mapknitter!

FROM ruby:2.4.4-stretch

# Set correct environment variables.
ENV HOME /root

# Install dependencies
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get update -qq && apt-get install -y default-libmysqlclient-dev \
                                             ruby-rmagick libfreeimage3 \
                                             libfreeimage-dev ruby-dev \
                                             gdal-bin python-gdal curl \
                                             libcurl4-openssl-dev libssl-dev \
                                             zip nodejs ##ALSO TRIED: ruby-pg

RUN npm install -g bower

WORKDIR /app
COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock
COPY start.sh /app/start.sh

CMD [ "sh", "start.sh" ]
