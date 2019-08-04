#!/bin/bash -l

pidfile=/app/tmp/pids/server.pid

bump_database(){
	bundle exec rails db:schema:load || bundle exec rails db:migrate
}

bundle update
bundle check || bundle install

if bundle exec rails db:exists; then
	>&2 echo "Database exists, only migrating it..."
	bundle exec rails db:migrate
else
	>&2 echo "Database doesn't exist, creating and migrating it..."
	bundle exec rails db:create
	bump_database
fi

bundle exec rails assets:precompile

if [ -f $pidfile ] ; then
	>&2 echo 'Server PID file already exists. Removing it...';
	rm $pidfile;
fi

bundle exec foreman start
