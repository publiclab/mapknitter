require 'test_helper'

class TagsControllerTest < ActionController::TestCase

  # called before every single test
  def setup
    @map = maps(:saugus)
    @tag = tags(:nice)
  end 

  test "should create tag" do
    session[:user_id] = 1 # log in
    post(:create, :map_id => @map.id, :tags => "test,nice")
    assert_response :redirect
  end

  test "should get tag show page" do
    get :show, :id => "nice"
    assert_response :success
    assert_not_nil :maps, :tag
  end

end
