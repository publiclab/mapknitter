require 'simplecov-cobertura'

if ENV['CI'] == 'true'
  SimpleCov.formatter = SimpleCov::Formatter::CoberturaFormatter
else
  SimpleCov.formatter = SimpleCov::Formatter::HTMLFormatter
end

SimpleCov.start 'rails' do
  add_filter '/test/'
  add_filter '/db/'
  add_filter '/log/'
  add_filter '/tmp/'
end
