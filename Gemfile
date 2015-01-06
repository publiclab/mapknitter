source "https://rubygems.org"

ruby "2.1.2"
gem "rails", "~>3.2"

gem "will_paginate", "3.0.7"

# dependencies
group :dependencies do
  gem "mysql", "2.9.1"
  gem "mysql2"
  gem "geokit-rails", "1.1.4"
  gem "image_science", "1.2.6"
  gem "recaptcha", "0.3.6", :require => "recaptcha/rails"
  gem "oa-openid", "0.3.2"
  gem "ruby-openid", "~>2.5"
  gem 'open_id_authentication'
  gem "RubyInline"
  gem "paperclip", "~>4.2.0"

  # if you use amazon s3 for warpable image storage
  gem 'aws-sdk', '~> 1.5.7'

  # for rake image migration tasks
  gem 'right_aws'

  # compiling markdown to html
  gem "rdiscount", "2.1.7.1"

  # asset pipelining
  gem "sprockets"#, "2.12.1"
  gem "sass"
  gem "autoprefixer-rails"

  # gem "friendly_id", "3.3.3.0"
end

group :development do
  gem "jshintrb"
  gem "therubyracer"
end

group :sqlite do
  # if you decide to use sqlite3 as the database
  gem "sqlite3"
end

group :passenger do
  # passenger server
  gem "passenger"
end
