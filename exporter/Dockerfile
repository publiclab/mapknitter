# Debian base
FROM debian:buster

MAINTAINER Sebastian Silva <sebastian@fuentelibre.org>

# Install the application.
RUN apt-get update -qq && apt-get install -y gdal-bin ruby imagemagick ruby-sinatra ruby-kramdown

# Externally accessible data is by default put in /data
# WORKDIR /data
# VOLUME ["/data"]

# Output version and capabilities by default.
# CMD gdalinfo --version && gdalinfo --formats && ogrinfo --formats

ADD . /app
WORKDIR /app

CMD ruby app.rb -o 0.0.0.0 -p 80
