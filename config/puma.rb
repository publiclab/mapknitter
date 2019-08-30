#!/usr/bin/env puma

environment ENV.fetch("RAILS_ENV") { "production" }

pidfile '/app/tmp/pids/puma.pid'