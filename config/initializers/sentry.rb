Sentry.init do |config|
  config.environment = ENV["COMPOSE_PROJECT_NAME"] || ENV["RAILS_ENV"] || %w(production)
  config.enabled_environments = %w[production, mapknitter_stable, mapknitter_unstable]
  config.breadcrumbs_logger = [:sentry_logger, :http_logger]
  # To activate performance monitoring, set one of these options.
  # We recommend adjusting the value in production:
  config.traces_sample_rate = 0.5
  # use Rails' parameter filter to sanitize the event payload:
  # for Rails 6+:
  # filter = ActiveSupport::ParameterFilter.new(Rails.application.config.filter_parameters)
  # for Rails 5:
  filter = ActionDispatch::Http::ParameterFilter.new(Rails.application.config.filter_parameters)
  config.before_send = lambda do |event, hint|
    filter.filter(event.to_hash)
  end
end