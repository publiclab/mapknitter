require 'test_helper'

class FeedsControllerTest < ActionController::TestCase
  # called before every single test
  def setup
    @map = maps(:saugus)
    @tag = tags(:nice)
  end

  test "should get main feed (all)" do
    get :all
    assert_response :success
    assert_not_nil :maps
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/all'
  end

  test "should get clean feed" do
    get :all
    assert_response :success
    assert_not_nil :maps
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/all'
  end

  test 'get clean' do
    get :clean
    assert_response :success
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/clean'
  end

  test "should get clean feed with moderators links" do
    get :all, params: { moderators: 'true'}
    assert_response :success
    assert_not_nil :maps
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/all'
  end

  test "should get license feed" do
    get :license, params: { :id => "publicdomain"}
    assert_response :success
    assert_not_nil :maps
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/license'
  end

  test "should get author feed" do
    get :author, params: { :id => "quentin"}
    assert_response :success
    assert_not_nil :maps
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/author'
  end

  test "should get tag feed" do
    get :tag, params: { id: 'nice'}
    assert_response :success
    assert_not_nil :tag
    assert_not_nil :maps
    assert_template 'feeds/tag'
  end

  test 'rescues if tag not present' do
    get :tag, params: { id: 'cess'}
    assert_equal 'text/plain', @response.content_type
    assert_equal 'No maps with tag cess', @response.body
  end
end
