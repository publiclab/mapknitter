# Dockerfile # Mapknitter
# https://github.com/publiclab/mapknitter/
# This image deploys Mapknitter!

FROM ruby:2.4.6-stretch

# Set correct environment variables.
ENV HOME /root

# Backported GDAL
RUN echo "deb http://packages.laboratoriopublico.org/publiclab/ stretch main" > /etc/apt/sources.list.d/publiclab.list

# We bring our own key to verify our packages
COPY sysadmin.publiclab.key /app/sysadmin.publiclab.key
RUN apt-key add /app/sysadmin.publiclab.key

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
  nodejs gdal-bin curl procps git imagemagick python-gdal zip

# Configure ImageMagick
COPY ./nolimit.xml /etc/ImageMagick-6/policy.xml

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y npm
RUN npm install -g yarn

# Install bundle of gems
SHELL [ "/bin/bash", "-l", "-c" ]
WORKDIR /tmp
ADD Gemfile /tmp/Gemfile
ADD Gemfile.lock /tmp/Gemfile.lock
RUN bundle install

# Add the Rails app
WORKDIR /app
COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock
COPY start.sh /app/start.sh

CMD [ "bash", "-l", "start.sh" ]
