source "https://rubygems.org"

ruby "1.8.7"
gem "rails", "2.3.15"

# dependencies
group :dependencies do
	gem "mysql", "2.9.1"
	gem "geokit-rails", "1.1.4"
	gem "image_science", "1.2.6"
	gem "recaptcha", "0.3.6", :require => "recaptcha/rails"
	gem "will_paginate", "2.3.16"
	gem "oa-openid", "0.3.2"
	gem "httparty", "0.11.0"
	gem "RubyInline"
	gem "rdoc"
	gem "rdiscount", "2.1.7.1"
end

group :sqlite do
	# if you decide to use sqlite3 as the database
	gem "sqlite3"
end

group :passenger do
	# passenger server
	gem "passenger"
end