git checkout -b main
git pull -f origin main
gpg --keyserver hkp://pool.sks-keyservers.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
curl -sSL https://get.rvm.io | bash
source ~/.rvm/scripts/rvm
rvm install ruby-2.4.4
source $(rvm 2.4.4 do rvm env --path)
rvm use ruby-2.4.4
gem install rails -v 3.2.0
sudo apt-get update
#install mysql with a blank password and prevents a password prompt during installation
sudo apt-get -y install bundler libmysqlclient-dev imagemagick ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev libmagickcore-dev libmagickwand-dev mysql-server
# exporter-only:
#sudo apt-get install gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip
gem install bundler
bundle install
cp db/schema.rb.example db/schema.rb
cp config/database.yml.cloud9.example config/database.yml
cp config/config.yml.example config/config.yml
sudo service mysql start
mysql -u root -e "create user 'mapknitter'@'localhost' identified by 'mapknitter';" -p
mysql -u root -e 'create database mapknitter;' -p
mysql -u root -e 'create database mapknittertest;' -p
rake db:setup
sudo apt-get -y install npm nodejs-legacy
sudo npm install -g bower
bower install
echo "Done! Run the application with 'rails s -b \$IP -p \$PORT'"

