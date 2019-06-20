source "https://rubygems.org"

ruby '2.4.6'
gem 'rails', '4.2.11.1'
gem 'rake',  '~> 12.3.2'
gem 'skylight'

gem "will_paginate", "3.1.7"
gem 'will_paginate-bootstrap4'
gem "friendly_id"
gem 'popper_js', '~> 1.11', '>= 1.11.1'
gem 'protected_attributes'

# dependencies
group :dependencies do
  gem 'mysql2', '< 0.4'
  gem "geokit-rails", "1.1.4"
  gem 'image_science', '1.3.0'
  gem "recaptcha", :require => "recaptcha/rails"
  gem "oa-openid", "0.3.2"
  gem "ruby-openid", "~>2.5"
  gem "open_id_authentication"
  gem "RubyInline"
  gem "paperclip", "~>4.3.7"

  # if you use amazon s3 for warpable image storage
  gem 'aws-sdk', '~> 1.5.7'

  # for rake image migration tasks
  # gem 'right_aws'
  gem 'right_aws_api'

  # compiling markdown to html
  gem "rdiscount", "2.2.0.1"

  # asset pipelining
  gem 'bootstrap-sass'
  gem 'sassc-rails'
  gem 'jquery-rails'
  gem "sprockets"
  gem "sprockets-rails"
  gem "sass", :require => 'sass'
  gem "autoprefixer-rails"
  gem "uglifier"
end

group :test do
  gem 'rubocop', '~> 0.71.0'
  gem 'ruby-prof'
  gem 'rails-perftest'
  gem 'simplecov', require: false
  gem 'simplecov-cobertura', require: false
  gem 'minitest'
  gem 'minitest-reporters'
end

group :development, :test do
  gem "byebug"
  gem 'faker'
  gem 'pry-rails'
end

group :development do
  gem "jshintrb"
  gem "therubyracer"
  gem 'web-console', '~> 2.0'
end

group :sqlite do
  # if you decide to use sqlite3 as the database
  gem "sqlite3"
end

group :passenger do
  # passenger server
  gem "passenger"
end

gem 'httparty'
