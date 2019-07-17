# Dockerfile # Mapknitter
# https://github.com/publiclab/mapknitter/
# This image deploys Mapknitter!

FROM ruby:2.6.3-stretch

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

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && apt-get install -y npm
RUN npm install -g yarn

# See https://github.com/instructure/canvas-lms/issues/1404#issuecomment-461023483 and
# https://github.com/publiclab/mapknitter/pull/803
RUN git config --global url."https://".insteadOf git://

# Install bundle of gems
# Add the Rails app
COPY . /app/
WORKDIR /app

CMD [ "sh", "/app/start.sh" ]
