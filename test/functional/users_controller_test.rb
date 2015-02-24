require File.dirname(__FILE__) + '/../test_helper'
require 'users_controller'

# Re-raise errors caught by the controller.
class UsersController; def rescue_action(e) raise e end; end

class UsersControllerTest < ActionController::TestCase

  fixtures :users

  # called before every single test
  def setup
    @user = users(:quentin)
  end 

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil :users
  end

  test "should get profile" do
    get(:profile, id: @user.login)
    assert_response :success
    assert_not_nil :user
  end

end
