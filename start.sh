#!/bin/bash -l

pidfile=/app/tmp/pids/server.pid

bundle check || bundle install
yarn --ignore-engines --ignore-scripts --modules-folder ./public/lib

if [ -f $pidfile ] ; then
	>&2 echo 'Server PID file already exists. Removing it...';
	rm $pidfile;
fi

bundle exec rails s -p 3000 -b '0.0.0.0'
