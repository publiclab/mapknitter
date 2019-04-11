require 'test_helper'

class MapsControllerTest < ActionController::TestCase

  # called before every single test
  def setup
    @map = maps(:saugus)
  end 

  # called after every single test
  def teardown
  end

  test "should display image url for maps by region" do
    get :region , { minlat: 40, maxlat: 50, minlon: -80, maxlon: -60, format: :json}

    image_urls = []
    @map.warpables.each do | warpable|
      image_urls.append(warpable.image.url)
    end

    json_response = JSON.parse(response.body)

    assert_response :success
    assert_equal image_urls, json_response[0]['image_urls']
  end

  test "should get index" do
    get :index
    @maps = assigns(:maps)

    assert_response :success
    assert @maps.collect(&:name).include?("Saugus Landfill Incinerator")
    assert @maps.collect(&:name).include?("Cubbon Park")
    assert @maps.collect{ |map| map.user.login}.include?("quentin")
  end

  test "should not display archived maps" do
    session[:user_id] = 1
    get(:archive, id: @map.slug)
    get :index
    @maps = assigns(:maps)

    assert_response :success
    assert !@maps.collect(&:name).include?("Saugus Landfill Incinerator")
    assert @maps.collect(&:name).include?("Cubbon Park")
    assert @maps.collect{ |map| map.user.login}.include?("quentin")
  end

  test "should get map of maps" do
    get :map
    assert_response :success
  end

  test "should get new" do
    get :new
    assert_response :success
    assert_not_nil assigns(:map)
  end

  test "should search for maps by name" do
    get :search, q: 'Saugus'
    @maps = assigns(:maps)

    assert_response :success
    assert @maps.collect(&:name).include?("Saugus Landfill Incinerator")
    assert !@maps.collect(&:name).include?("Cubbon Park")
  end

  test "should search for maps by location" do
    get :search, q: 'India'
    @maps = assigns(:maps)

    assert_response :success
    assert !@maps.collect(&:name).include?("Saugus Landfill Incinerator")
    assert @maps.collect(&:name).include?("Cubbon Park")
  end

  test "should search for maps by description" do
    get :search, q: 'a park'
    @maps = assigns(:maps)

    assert_response :success
    assert !@maps.collect(&:name).include?("Saugus Landfill Incinerator")
    assert @maps.collect(&:name).include?("Cubbon Park")
  end

  test "should create map if logged in" do
    session[:user_id] = 1
    before_count = Map.count
    post(:create, map: {
      name: "Coal terminal map", 
      slug: "coal-terminal",
      location: "London",
      lat: 42.43823313018592,
      lon: -70.9849190711975
    })
    @map = assigns(:map)

    assert_response 302
    assert_redirected_to '/maps/'+@map.slug
    assert_not_equal before_count, Map.count
    assert Map.all.collect(&:name).include?("Coal terminal map")
    assert_equal @map.user.login, "quentin"
  end

  test "should create map if not logged in" do
    before_count = Map.count
    post(:create, map: {
      name: "Coal terminal map", 
      slug: "coal-terminal",
      location: "London",
      lat: 42.43823313018592,
      lon: -70.9849190711975
    })
    @map = assigns(:map)

    assert_redirected_to '/maps/'+@map.slug
    assert_not_equal before_count, Map.count
    assert Map.all.collect(&:name).include?("Coal terminal map")
    assert_nil @map.user
  end

  test "should render new if map not created" do
    session[:user_id] = 1
    before_count = Map.count
    post(:create, map: {
      name: "Coal terminal map", 
      slug: "coal-terminal"
    })
    @map = assigns(:map)

    assert_response :success
    assert_template :new
    assert_equal before_count, Map.count
    assert !Map.all.collect(&:name).include?("Coal terminal map")
  end

  test "should not delete map if not owner" do
    session[:user_id] = 3
    before_count = Map.count
    post(:destroy, id: @map.id)

    assert_redirected_to "/maps/" + @map.slug
    assert_equal flash[:error], "Only admins or map owners may delete maps."
    assert_equal before_count, Map.count
  end

  test "should delete map if owner" do
    session[:user_id] = 1
    before_count = Map.count
    post(:destroy, id: @map.id)

    assert_redirected_to '/'
    assert_not_equal before_count, Map.count
    assert_equal flash[:notice], "Map deleted."
  end

  test "should get show" do
    get(:show, id: @map.id)
    assert_response :success
    assert_not_nil assigns(:map)
  end

  test "should archive map" do
    session[:user_id] = 1
    get(:archive, id: @map.slug)
    @map.reload

    assert_redirected_to '/?_=' + Time.now.to_i.to_s
    assert_true @map.archived
  end

  test "should not archive map without enough permissions" do
    session[:user_id] = 3
    get(:archive, id: @map.slug)
    @map.reload

    assert_redirected_to '/?_=' + Time.now.to_i.to_s
    assert_false @map.archived
  end

  test "should update map" do
    session[:user_id] = 1
    put(:update,
        id: 1,
        map: {
          name: "Schrute farms",
          location: "USA",
          lat: 44,
          lon: -74,
          description: "A really green farm"
        },
        tags: "beets bears")
    @map.reload

    assert_redirected_to "/maps/" + @map.id.to_s
    assert_equal "Schrute farms", @map.name
    assert_equal 44, @map.lat
    assert_equal -74, @map.lon
    assert_equal "A really green farm", @map.description
    assert @map.has_tag("beets")
    assert @map.has_tag("bears")
  end

  test "should display maps by region"do
    get :region , { minlat: 40, maxlat: 50, minlon: -80, maxlon: -60}
    @maps = assigns(:maps)

    assert_response :success
    assert @maps.collect(&:name).include?("Saugus Landfill Incinerator")
  end
end
