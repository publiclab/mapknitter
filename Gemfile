source "https://rubygems.org"

ruby "2.4.4"
gem "rails", "~>3.2"
gem 'rake',  '~> 12.3.2'

gem "will_paginate", "3.1.7"
gem "will_paginate-bootstrap"
gem "friendly_id"

# dependencies
group :dependencies do
  gem 'mysql2', '< 0.4'
  gem "geokit-rails", "1.1.4"
  gem "image_science", "1.2.6"
  gem "recaptcha", :require => "recaptcha/rails"
  gem "oa-openid", "0.3.2"
  gem "ruby-openid", "~>2.5"
  gem "open_id_authentication"
  gem "RubyInline"
  gem "coveralls", require: false
  gem "paperclip", "~>4.3.7"

  # if you use amazon s3 for warpable image storage
  gem 'aws-sdk', '~> 1.5.7'

  # for rake image migration tasks
  gem 'right_aws'

  # compiling markdown to html
  gem "rdiscount", "2.2.0.1"

  # asset pipelining
  gem "sprockets"#, "2.12.1"
  gem "sass", :require => 'sass'
  gem "autoprefixer-rails"
  gem "uglifier"

end

group :test do
  gem 'test-unit'    
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
