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

  def custom_setup
    @map = maps(:cubbon)
    @map.spam
    @map.user.ban
  end

  test "should get the list of authors" do
    get :index
    @users = assigns(:users)

    assert_response :success
    assert_not_nil :users
    assert_equal 3, @users.length
  end

  test "should exclude banned users from the list of authors" do
    custom_setup
    get :index
    @users = assigns(:users)

    assert_response :success
    assert_not_nil :users
    assert_equal 2, @users.length
  end

  test "should get the profile of an unbanned user" do
    get(:profile, params: {id: @user.login} )

    assert_response :success
    assert_not_nil :user
  end

  test "should get the profile of a banned user for an admin" do
    custom_setup
    session[:user_id] = 2
    get(:profile, params: {id: @user.login} )

    assert_response :success
    assert_not_nil :user
    assert_equal 'This author has been banned', flash.now[:error]
  end

  test "should redirect a non-admin to home if the profile to be viewed has been banned" do
    custom_setup
    get(:profile, params: {id: @user.login} )

    assert_response :redirect
    assert_not_nil :user
    assert_equal 'That author has been banned', flash[:error]
  end

  test "should get the profile of the current logged-in user if no param is provided" do
    session[:user_id] = 2
    get(:profile)
    user = assigns(:user)

    assert_response :success
    assert_not_nil :user
    assert_equal 2, user.id
  end
end
