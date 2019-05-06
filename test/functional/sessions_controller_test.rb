require File.dirname(__FILE__) + '/../test_helper'
require 'sessions_controller'

# Re-raise errors caught by the controller.
class SessionsController; def rescue_action(e) raise e end; end

class SessionsControllerTest < ActionController::TestCase
  test 'new when logged in' do
    session[:user_id] = 1
    get :new
    assert_redirected_to '/'
  end

  test 'new when not logged in' do
    get :new
    assert_template 'sessions/new'
  end

  test 'logs out a user' do
    session[:user_id] = 1
    get :logout
    assert_nil session[:user_id]
    assert flash[:success].present?
    assert_equal 'You have successfully logged out.', flash[:success]
    assert_redirected_to "/?_=#{Time.now.to_i}"
  end

  test 'successful local login' do
    system('cp config/config.yml.example config/config.yml')
    get :local, login: 'quentin'
    assert_response :redirect
    assert flash[:success].present?
    assert_not_nil session[:user_id]
    assert_equal 1, session[:user_id]
    assert_redirected_to ''
  end

  test 'unsuccessful local login' do
    get :local, login: 'cess'
    assert_response :redirect
    assert flash[:error].present?
    assert_nil session[:user_id]
    assert_redirected_to '/'
  end

  #  def test_should_login_and_redirect
  #    post :create, :login => 'quentin', :password => 'monkey'
  #    assert session[:user_id]
  #    assert_response :redirect
  #  end

  #  def test_should_fail_login_and_not_redirect
  #    post :create, :login => 'quentin', :password => 'bad password'
  #    assert_nil session[:user_id]
  #    assert_response :success
  #  end

  #  def test_should_logout
  #    login_as :quentin
  #    get :destroy
  #    assert_nil session[:user_id]
  #    assert_response :redirect
  #  end

  #  def test_should_remember_me
  #    @request.cookies["auth_token"] = nil
  #    post :create, :login => 'quentin',
  #                  :password => 'monkey',
  #                  :remember_me => "1"
  #    assert_not_nil @response.cookies["auth_token"]
  #  end

  #  def test_should_not_remember_me
  #    @request.cookies["auth_token"] = nil
  #    post :create, :login => 'quentin',
  #                  :password => 'monkey',
  #                  :remember_me => "0"
  #    puts @response.cookies["auth_token"]
  #    assert @response.cookies["auth_token"].blank?
  #  end

  #  def test_should_delete_token_on_logout
  #    login_as :quentin
  #    get :destroy
  #    assert @response.cookies["auth_token"].blank?
  #  end

  #  def test_should_login_with_cookie
  #    users(:quentin).remember_me
  #    @request.cookies["auth_token"] = cookie_for(:quentin)
  #    get :new
  #    assert @controller.send(:logged_in?)
  #  end

  #  def test_should_fail_expired_cookie_login
  #    users(:quentin).remember_me
  #    users(:quentin).update_attribute
  #                      :remember_token_expires_at, 5.minutes.ago
  #    @request.cookies["auth_token"] = cookie_for(:quentin)
  #    get :new
  #    assert !@controller.send(:logged_in?)
  #  end

  #  def test_should_fail_cookie_login
  #    users(:quentin).remember_me
  #    @request.cookies["auth_token"] = auth_token('invalid_auth_token')
  #    get :new
  #    assert !@controller.send(:logged_in?)
  #  end

  protected

  def auth_token(token)
    CGI::Cookie.new(name: 'auth_token', value: token)
  end

  def cookie_for(user)
    auth_token users(user).remember_token
  end
end
