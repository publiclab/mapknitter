read -p "Enter your cloud9 username: " un
rvm install ruby-2.1.2
rvm 2.1.2
sudo apt-get install imagemagick ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev libmagickcore-dev libmagickwand-dev
sudo apt-get install gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip
mysql-ctl start
bower install
bundle install
rake cloud9 username=$un
rake db:setup
rake db:migrate
echo "Done! Now, click 'Run Project' at the top of the screen."

