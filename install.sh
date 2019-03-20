rvm install ruby-2.4.4
source $(rvm 2.4.4 do rvm env --path)
rvm use ruby-2.4.4
gem install rails -v 3.2.0
sudo apt-get update
sudo apt-get -y install bundler libmysqlclient-dev imagemagick ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev libmagickcore-dev libmagickwand-dev
# exporter-only:
#sudo apt-get install gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip
gem install bundler
bundle install
cp db/schema.rb.example db/schema.rb
cp config/database.yml.sqlite.example config/database.yml
rake db:setup
sudo apt-get install npm
sudo npm install -g bower
bower install
