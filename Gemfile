source 'https://rubygems.org'

ruby '2.4.6'
gem 'rails', '~> 5.0'
gem 'rake',  '~> 12.3.2'
gem 'skylight', '~> 4.0.2'

gem 'will_paginate', '3.1.7'
gem 'will_paginate-bootstrap4', '~> 0.2.2'
gem 'friendly_id'
gem 'popper_js', '~> 1.11', '>= 1.11.1'

# dependencies
group :dependencies do
  gem 'mysql2', '< 0.4'
  gem 'geokit-rails', '1.1.4'
  gem 'image_science', '1.3.0'
  gem 'recaptcha', '~> 4.14.0', require: 'recaptcha/rails'
  gem 'oa-openid', '0.3.2'
  gem 'ruby-openid', '~>2.5'
  gem 'open_id_authentication'
  gem 'RubyInline', '~> 3.12.4'
  gem 'paperclip'

  # if you use amazon s3 for warpable image storage
  gem 'aws-sdk', '~> 1.5.7'

  # for rake image migration tasks
  # gem 'right_aws'
  gem 'right_aws_api', '~> 0.3.5'


  # compiling markdown to html
  gem 'rdiscount', '2.2.0.1'

  # asset pipelining
  gem 'sprockets', '3.7.2'
  gem 'sass', :require => 'sass'
  gem 'autoprefixer-rails', '~> 9.5.1.1'
  gem 'uglifier', '~> 4.1.20'

end

group :test do
  gem 'rubocop', '~> 0.52.0'
  gem 'ruby-prof', '~> 0.18.0'
  gem 'rails-perftest', '~> 0.0.7'
  gem 'simplecov',  '~> 0.16.1', require: false
  gem 'simplecov-cobertura', '~> 1.3.1', require: false
  gem 'minitest', '~> 5.11.3'
  gem 'minitest-reporters', '~> 1.3.6'
end

group :development, :test do
  gem 'byebug', '~> 11.0.1'
  gem 'faker', '~> 1.9.3'
  gem 'pry-rails', '~> 0.3.9'
end

group :development do
  gem 'jshintrb', '~> 0.3.0'
  gem 'therubyracer', '~> 0.12.3'
  gem 'web-console', '~> 2.0'
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
