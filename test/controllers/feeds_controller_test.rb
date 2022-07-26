require 'test_helper'

class FeedsControllerTest < ActionController::TestCase
  # called before every single test
  def setup
  end

  def custom_setup
    maps(:cubbon).spam
  end

  test "should get main feed (all)" do
    get :all
    @maps = assigns(:maps)

    assert_response :success
    assert_not_nil :maps
    assert_equal 2, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/all'
  end

  test "should exclude spammed maps from main feed" do
    custom_setup
    get :all
    @maps = assigns(:maps)

    assert_response :success
    assert_not_nil :maps
    assert_equal 1, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/all'
  end

  test 'should get clean feed' do
    get :clean
    @maps = assigns(:maps)

    assert_response :success
    assert_not_nil :maps
    assert_equal 3, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/clean'
  end

  test "should get clean feed with moderators links" do
    get :clean, params: { moderators: 'true'}
    @maps = assigns(:maps)

    assert_response :success
    assert_not_nil :maps
    assert_equal 3, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/clean'
  end

  test "should get license feed" do
    get :license, params: { :id => "publicdomain"}
    @maps = assigns(:maps)

    assert_response :success
    assert_not_nil :maps
    assert_equal 3, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/license'
  end

  test "should get an empty license feed if there are no maps with the provided license" do
    get :license, params: { :id => "copyright"}
    @maps = assigns(:maps)

    assert_response :success
    assert_not_nil :maps
    assert_equal 0, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/license'
  end

  test "should get author feed" do
    get :author, params: { :id => "quentin"}
    author = assigns(:author)
    @maps = assigns(:maps)

    assert_response :success
    assert_not_nil author
    assert_equal 2, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/author'
  end

  test "should exclude spammed maps from author feed" do
    custom_setup
    get :author, params: { :id => "quentin"}
    @author = assigns(:author)
    @maps = assigns(:maps)

    assert_response :success
    assert_not_nil @author
    assert_equal 1, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/author'
  end

  test "should get an empty author feed if author has been banned" do
    users(:quentin).ban
    get :author, params: { :id => "quentin"}
    @author = assigns(:author)
    @maps = assigns(:maps)

    assert_response :success
    assert_nil @author
    assert_equal 0, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/author'
  end

  test "should get tag feed" do
    get :tag, params: { id: 'nice'}
    assert_response :success
    @tag = assigns(:tag)
    @maps = assigns(:maps)
    
    assert_not_nil @tag
    assert_equal 1, @maps.length
    assert_template 'feeds/tag'
  end

  test 'should get an empty tag feed if there are no maps with the provided tag' do
    get :tag, params: { id: 'cess'}
    assert_response :success
    @tag = assigns(:tag)
    @maps = assigns(:maps)

    assert_nil @tag
    assert_equal 0, @maps.length
    assert_equal 'application/xml', @response.content_type
    assert_template 'feeds/tag'
  end
end
