
require 'simplecov'
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
require 'minitest/reporters'
MiniTest::Reporters.use! [MiniTest::Reporters::ProgressReporter.new,
                          MiniTest::Reporters::JUnitReporter.new]
ENV["RAILS_ENV"] = "test"

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  fixtures :all

  # Add more helper methods to be used by all tests here...
  include ApplicationHelper
end
