
require_relative '../config/environment'
require 'rails/test_help'
require 'simplecov'
require 'simplecov-cobertura'
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
