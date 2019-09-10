# Specifies the `port` that Puma will listen on to receive requests; default is 3000.
port ENV.fetch("PORT") { 3000 }

# Specifies the `environment` that Puma will run in.
environment ENV.fetch("RAILS_ENV") { "production" }

pidfile 'tmp/pids/puma.pid'

# Allow puma to be restarted by `rails restart` command.
plugin :tmp_restart
