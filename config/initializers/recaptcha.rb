require "recaptcha/rails"

class ActionView::Base 
  include Recaptcha::ClientHelper 
end 

Recaptcha.configure do |config|
  config.site_key = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  config.secret_key = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
end
