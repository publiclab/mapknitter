source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.6.3'
gem 'rails', '~> 6.0.0.rc2'
gem 'rake',  '~> 12.3.2'
gem 'skylight'

gem 'will_paginate', '3.1.7'
gem 'will_paginate-bootstrap4', '~> 0.2.2'
gem 'friendly_id'
gem 'popper_js', '~> 1.11', '>= 1.11.1'

# dependencies
group :dependencies do
  gem 'mysql2', '< 0.6'
  gem 'geokit-rails', '1.1.4'
  gem 'image_science', '1.3.0'
  gem 'recaptcha', '~> 5.0', require: 'recaptcha/rails'
  gem 'oa-openid', '0.3.2'
  gem 'ruby-openid', '~>2.5'
  gem 'open_id_authentication'
  gem 'RubyInline', '~> 3.12.4'
  gem 'paperclip', '~> 6.1.0'
  gem 'bootsnap', '~> 1.4.4', require: false
  gem 'turbolinks', '~> 5.2'
  gem 'mini_magick', '~> 4.8'
  # Transpile app-like JavaScript. Read more: https://github.com/rails/webpacker
  gem 'webpacker', '~> 4.0'

  # if you use amazon s3 for warpable image storage
  gem 'aws-sdk', '~> 1.5.7'

  # for rake image migration tasks
  # gem 'right_aws'
  gem 'right_aws_api', '~> 0.3.5'

  # compiling markdown to html
  gem 'rdiscount', '2.2.0.1'

  # asset pipelining
  gem 'bootstrap-sass'
  gem 'sassc-rails'
  gem 'sass-rails', '~> 5'
  gem 'sass', require: 'sass'
  gem 'autoprefixer-rails', '~> 9.5.1.1'
  gem 'uglifier', '~> 4.1.20'

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
  # Easy installation and use of web drivers to run system tests with browsers
  #gem 'webdrivers'
  # Adds support for Capybara system testing and selenium driver
  #gem 'capybara', '>= 2.15'
  #gem 'selenium-webdriver'
end

group :development, :test do
  gem 'byebug', '~> 11.0.1', platforms: [:mri, :mingw, :x64_mingw]
  gem 'faker', '~> 1.9.3'
  gem 'pry-rails', '~> 0.3.9'
end

group :development do
  gem 'jshintrb', '~> 0.3.0'
  gem 'mini_racer', platforms: :ruby
  gem 'listen', '~> 3.1.5'
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

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
