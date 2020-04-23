#!/bin/bash -l

pidfile=/app/tmp/pids/server.pid

if [ ! -f "./config/initializers/recaptcha.rb" ]; then
    echo -e "\e[33mWARNING\e[0m: You haven't configured recaptcha!"
    echo -e "\e[94mRead More\e[0m: https://github.com/publiclab/mapknitter#installation-steps"
fi


DISABLE_DATABASE_ENVIRONMENT_CHECK=1 bundle exec rails assets:precompile

if [ -f $pidfile ] ; then
	>&2 echo 'Server PID file already exists. Removing it...';
	rm $pidfile;
fi

bundle exec rails s -p $PORT -b '0.0.0.0'
