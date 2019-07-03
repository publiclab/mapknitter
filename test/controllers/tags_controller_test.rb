require 'test_helper'

class TagsControllerTest < ActionController::TestCase
  # called before every single test
  def setup
    @map = maps(:saugus)
    @tag = tags(:nice)
  end

  test "should create tag" do
    session[:user_id] = 1 # log in
    post(:create, params: { :map_id => @map.slug, :tags => "test,nice"})
    assert_response :redirect
  end

  test "should get tag show page" do
    get :show, params: {id: "nice"} 
    assert_response :success
    assert_not_nil :maps, :tag
  end

  test "should redirect to login when not logged in" do
    post :create, params: { map_id: @map.slug, tags: "test,nice"}
    assert_redirected_to "/login?back_to=/maps/#{@map.slug}"
    assert flash.present?
  end

  test 'should destroy a tag' do
    session[:user_id] = 1
    delete :destroy, params: { id: @tag}
    assert flash[:notice].present?
    assert_redirected_to @tag.map
  end

  test 'should redirect destroy when not logged in' do
    delete :destroy, params: { id: @tag}
    assert_response :redirect
    assert flash.present?
  end
end
