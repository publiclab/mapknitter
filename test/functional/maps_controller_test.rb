require 'test_helper'

class MapsControllerTest < ActionController::TestCase

  # called before every single test
  def setup
    @map = maps(:saugus)
  end 

  # called after every single test
  def teardown
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil :maps
  end

  test "should get map of maps" do
    get :map
    assert_response :success
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should get search" do
    get :search, q: 'lalala'
    assert_response :success
  end

  test "should create map" do
    post(:create, map: {
      name: "Coal terminal map", 
      lat:42.43823313018592,
      lon:-70.9849190711975
    })
    assert_response :success
    # replace this with a rails-generated path:
    #assert_redirected_to '/maps/'+assigns['map'].slug
  end

  test "should not delete map if not owner" do
    session[:user_id] = 3
    post(:destroy, id: @map.id)
    #assert_equal flash[:error], "Only admins or map owners may delete maps."
    assert_redirected_to '/maps/'+@map.slug
  end

  test "should delete map if owner" do
    session[:user_id] = 1
    post(:destroy, id: @map.id)
    assert_redirected_to '/'
  end

  test "should get show" do
    get(:show, id: @map.id)
    assert_response :success
  end

end
