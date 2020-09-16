source 'https://rubygems.org'

ruby '2.4.6'
gem 'rails', '~> 5.2.4'
gem 'rake',  '~> 13.0.1'
gem 'tzinfo-data'
gem 'skylight'
gem 'sentry-raven'

gem 'will_paginate', '3.3.0'
gem 'will_paginate-bootstrap4', '~> 0.2.2'
gem 'friendly_id'
gem 'popper_js', '~> 1.11', '>= 1.11.1'
gem 'paper_trail'

# dependencies
group :dependencies do
  gem 'mysql2', '< 0.6'
  gem 'geokit-rails', '1.1.4'
  gem 'image_science', '1.3.1'
  gem 'recaptcha', '~> 5.5.0', require: 'recaptcha/rails'
  gem 'oa-openid', '0.3.2'
  gem 'ruby-openid', '~>2.9'
  gem 'open_id_authentication'
  gem 'RubyInline', '~> 3.12.5'
  gem 'paperclip', '~> 6.1.0'
  gem 'bootsnap', '~> 1.4.8'
  gem 'turbolinks', '~> 5'
  gem 'mini_magick', '~> 4.8'
  gem 'puma', '~> 4.3.6'

  # if you use amazon s3 for warpable image storage
  gem 'aws-sdk-s3', '~> 1'

  # for rake image migration tasks
  # gem 'right_aws'
  gem 'right_aws_api', '~> 0.3.5'

  # compiling markdown to html
  gem 'rdiscount', '2.2.0.2'

  # asset pipelining
  gem 'bootstrap-sass'
  gem 'sassc-rails'
  gem 'jquery-rails'
  gem 'sprockets', '3.7.2'
  gem 'sprockets-rails'
  gem 'sass', require: 'sass'
  gem 'autoprefixer-rails', '~> 10.0.0'
  gem 'uglifier', '~> 4.2.0'

end

group :test do
  gem 'rubocop', '~> 0.70.0'
  gem 'rubocop-performance'
  gem 'ruby-prof'
  gem 'rails-perftest'
  gem 'rails-controller-testing'
  gem 'simplecov', require: false
  gem 'codecov', require: false
  gem 'minitest'
  gem 'minitest-reporters'
  # for creating sessions on capybara
  gem 'rack_session_access'
end

group :development, :test do
  gem 'capybara'
  # see https://github.com/SeleniumHQ/selenium/issues/5248
  # gem 'webdrivers'
  gem 'selenium-webdriver'
  gem 'byebug', '~> 11.1.3', platforms: [:mri, :mingw, :x64_mingw]
  gem 'faker', '~> 2.12.0'
  gem 'pry-rails', '~> 0.3.9'
  gem 'action-cable-testing'
end

group :development do
  gem 'jshintrb', '~> 0.3.0'
  gem 'mini_racer', platforms: :ruby
  gem 'listen', '~> 3.2.1'
  gem 'web-console', '~> 3.3'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :sqlite do
  # if you decide to use sqlite3 as the database
  gem 'sqlite3'
end

group :passenger do
  # passenger server
  gem 'passenger'
end

gem 'httparty'
