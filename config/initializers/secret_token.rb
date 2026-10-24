# Be sure to restart your server when you modify this file.
# If you change this key, all old signed cookies will become invalid!
if Rails.env.production?
  secret_key_base = ENV["SECRET_KEY_BASE"]
  insecure_secret_key_base = 'asdfjdasgaisaolghrwiohrkahguilboiwelkxwbranjkl'

  if secret_key_base.blank? || secret_key_base.length < 30 || secret_key_base == insecure_secret_key_base
    raise "Set SECRET_KEY_BASE to a unique random value of at least 30 characters (e.g. `rake secret`)."
  end

  Mapknitter::Application.config.secret_key_base = secret_key_base
end
