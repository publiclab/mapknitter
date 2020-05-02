require "recaptcha/rails"

class ActionView::Base 
  include Recaptcha::Adapters::ViewMethods
  include Recaptcha::Adapters::ControllerMethods
end 

Recaptcha.configure do |config|
  config.site_key = ENV['RECAPTCHA_KEY']
  config.secret_key = ENV['RECAPTCHA_SECRET_KEY']
end
