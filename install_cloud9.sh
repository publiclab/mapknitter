read -p "Enter your cloud9 username: " un
rvm install ruby-2.1.2
rvm 2.1.2
sudo apt-get install imagemagick ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev libmagickcore-dev libmagickwand-dev
sudo apt-get install gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip
mysql-ctl start
bower install
bundle install
bundle exec rake cloud9 username=$un
bundle exec rake db:setup
bundle exec rake db:migrate
sudo bundle exec rails server -p $PORT -b $IP
