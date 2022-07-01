# Dockerfile # Mapknitter
# https://github.com/publiclab/mapknitter/
# This image deploys Mapknitter!

FROM ruby:2.7.6

# Set correct environment variables.
ENV HOME /root

# We bring our own key to verify our packages
COPY sysadmin.publiclab.key /app/sysadmin.publiclab.key
RUN apt-key add /app/sysadmin.publiclab.key > /dev/null 2>&1

# Install dependencies for Mapknitter
RUN apt-get update -qq && apt-get install --allow-unauthenticated -y --no-install-recommends \
  nodejs curl procps git imagemagick

# Configure ImageMagick
COPY ./nolimit.xml /etc/ImageMagick-6/policy.xml

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y npm
RUN npm install -g yarn

# See https://github.com/instructure/canvas-lms/issues/1404#issuecomment-461023483 and
# https://github.com/publiclab/mapknitter/pull/803
RUN git config --global url."https://".insteadOf git://

# Install bundle of gems
# Add the Rails app
COPY . /app/
WORKDIR /app

RUN apt-get clean && \
    apt-get autoremove -y

ENV BUNDLER_VERSION=2.1.4
RUN gem install --default bundler && \
    gem update --system && \
    bundle install

CMD [ "sh", "/app/start.sh" ]
