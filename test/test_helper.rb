
require_relative '../config/environment'
require 'simplecov'

if ENV['CI'] == 'true'
  require 'codecov'
  SimpleCov.formatter = SimpleCov::Formatter::Codecov
end

SimpleCov.start

require "rack_session_access/capybara"
require 'rails/test_help'
require 'minitest/reporters'
MiniTest::Reporters.use! [MiniTest::Reporters::ProgressReporter.new,
                          MiniTest::Reporters::JUnitReporter.new]
ENV["RAILS_ENV"] = "test"

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  fixtures :all
  # Add more helper methods to be used by all tests here...
  include ApplicationHelper
end
