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
  end

  test "should get clean feed" do
    get :all
    assert_response :success
    assert_not_nil :maps
  end

  test "should get clean feed with moderators links" do
    get :all, :moderators => 'true'
    assert_response :success
    assert_not_nil :maps
  end

  test "should get license feed" do
    get :license, :id => "publicdomain"
    assert_response :success
    assert_not_nil :maps
  end

  test "should get author feed" do
    get :author, :id => "quentin"
    assert_response :success
    assert_not_nil :maps
  end

  test "should get tag feed" do
    get :tag, :id => "nice"
    assert_response :success
    assert_not_nil :tag
    assert_not_nil :maps
  end

end
