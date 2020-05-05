#!/bin/bash -l

pidfile=/app/tmp/pids/server.pid

cp config/database.yml.example config/database.yml
cp config/config.yml.example config/config.yml
cp config/initializers/recaptcha.rb.example config/initializers/recaptcha.rb
cp db/schema.rb.example db/schema.rb
mkdir -p tmp/pids
rm -rf tmp/cache/bootsnap*

if [ ! -f "./config/initializers/recaptcha.rb" ]; then
    echo -e "\e[33mWARNING\e[0m: You haven't configured recaptcha!"
    echo -e "\e[94mRead More\e[0m: https://github.com/publiclab/mapknitter#installation-steps"
fi

bump_database(){
	bundle exec rails db:schema:load || bundle exec rails db:migrate
}

bundle check || bundle install

if bundle exec rails db:exists; then
	>&2 echo "Database exists, only migrating it..."
	bundle exec rails db:migrate
else
	>&2 echo "Database doesn't exist, creating and migrating it..."
	bundle exec rails db:create
	bump_database
fi

rake assets:precompile

if [ -f $pidfile ] ; then
	>&2 echo 'Server PID file already exists. Removing it...';
	rm $pidfile;
fi

forego start
