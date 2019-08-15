sudo add-apt-repository -y ppa:ubuntugis/ppa
sudo apt-get update

# Installing Mapknitter dependencies
sudo apt-get install -y gdal-bin \
                        python3-gdal \
                        python-gdal \
                        curl \
                        libcurl4-openssl-dev \
                        libssl-dev zip \
                        libmysqlclient-dev \
                        imagemagick \
                        ruby-rmagick \
                        libfreeimage3 \
                        libfreeimage-dev \
                        ruby-dev \
                        libmagickcore-dev \
                        libmagickwand-dev

# Installing system tests dependencies
sudo apt-get install -y fonts-liberation \
                        libappindicator3-1 \
                        libasound2 \
                        libatk-bridge2.0-0 \
                        libatspi2.0-0 \
                        libgtk-3-0 \
                        libnspr4 \
                        libnss3 \
                        libx11-xcb1 \
                        libxss1 \
                        libxtst6 \
                        lsb-release \
                        xdg-utils

sudo wget https://github.com/webnicer/chrome-downloads/raw/master/x64.deb/google-chrome-stable_75.0.3770.142-1_amd64.deb \
           -O google-chrome.deb
sudo dpkg -i google-chrome.deb
sudo apt-get -fy install
sudo wget https://chromedriver.storage.googleapis.com/74.0.3729.6/chromedriver_linux64.zip
sudo unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/local/bin/chromedriver
sudo chmod +x /usr/local/bin/chromedriver
