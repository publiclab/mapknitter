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

# Install dependencies for Mapknitter
RUN apt-get update -qq && apt-get install -y \
  nodejs gdal-bin curl procps git imagemagick python-gdal zip

# Install dependencies for system tests
RUN apt-get -y install fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libatspi2.0-0 libgtk-3-0 libnspr4 \
    libnss3 libx11-xcb1 libxss1 libxtst6 lsb-release xdg-utils && \
    wget https://github.com/webnicer/chrome-downloads/raw/master/x64.deb/google-chrome-stable_75.0.3770.142-1_amd64.deb \
          -O google-chrome.deb && \
    dpkg -i google-chrome.deb && \
    apt-get -fy install && \
    wget https://chromedriver.storage.googleapis.com/74.0.3729.6/chromedriver_linux64.zip && \
    unzip chromedriver_linux64.zip && \
    mv chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver

# Configure ImageMagick
COPY ./nolimit.xml /etc/ImageMagick-6/policy.xml

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && apt-get install -y npm
RUN npm install -g yarn

# Installing ForeGo to schedule processes
RUN wget https://bin.equinox.io/c/ekMN3bCZFUn/forego-stable-linux-amd64.tgz && \
    tar xvf forego-stable-linux-amd64.tgz -C /usr/local/bin && \
    rm forego-stable-linux-amd64.tgz

# See https://github.com/instructure/canvas-lms/issues/1404#issuecomment-461023483 and
# https://github.com/publiclab/mapknitter/pull/803
RUN git config --global url."https://".insteadOf git://

# Install bundle of gems
# Add the Rails app
COPY . /app/
WORKDIR /app

CMD [ "sh", "/app/start.sh" ]
