require 'test_helper'

class MapsControllerTest < ActionController::TestCase

  def setup
    @map = maps(:saugus)
  end

  def teardown
  end

  test 'should display image url for maps by region' do
    get :region,
        { minlat: 40, maxlat: 50, minlon: -80, maxlon: -60, format: :json }

    image_urls = []
    @map.warpables.each do |warpable|
      image_urls.append(warpable.image.url)
    end

    json_response = JSON.parse(response.body)

    assert_response :success
    assert_equal image_urls, json_response[0]['image_urls']
  end

  test 'should get maps index' do
    get :index
    @maps = assigns(:maps)

    assert_response :success
    assert @maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert @maps.collect(&:name).include?('Cubbon Park')
    assert @maps.collect { |map| map.user.login }.include?('quentin')
  end

  test 'should not display archived maps' do
    session[:user_id] = 1
    get(:archive, id: @map.slug)
    get :index
    @maps = assigns(:maps)

    assert_response :success
    assert !@maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert @maps.collect(&:name).include?('Cubbon Park')
    assert @maps.collect { |map| map.user.login }.include?('quentin')
  end

  test 'should get map of maps' do
    get :map
    assert_response :success
    assert_includes @response.body, @map.slug
  end

  test 'should get new' do
    get :new
    assert_response :success
    assert_not_nil assigns(:map)
  end

  test 'should search for maps by name' do
    get :search, q: 'Saugus'
    @maps = assigns(:maps)

    assert_response :success
    assert @maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert !@maps.collect(&:name).include?('Cubbon Park')
    assert_template 'front_ui/gallery'
  end

  test 'should search for maps by location' do
    get :search, q: 'India'
    @maps = assigns(:maps)

    assert_response :success
    assert_equal "Search results for 'India'", assigns(:title)
    assert !@maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert @maps.collect(&:name).include?('Cubbon Park')
    assert_template 'front_ui/gallery'
  end

  test 'should search for maps by description' do
    get :search, q: 'a park'
    @maps = assigns(:maps)

    assert !@maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert @maps.collect(&:name).include?('Cubbon Park')
    assert_response :success
    assert_template 'front_ui/gallery'
  end

  test 'query should be at least 3 chars long' do
    get :search, q: 'ce'
    msg = 'Invalid Query: non white-space character count is less than 3'

    assert_response :success
    assert flash.present?
    assert_not_nil assigns(:authors)
    assert_equal msg, flash[:info]
    assert_template 'front_ui/gallery'
  end

  test 'should create map if logged in' do
    session[:user_id] = 1
    before_count = Map.count
    post(:create, map: {
           name: 'Coal terminal map',
           slug: 'coal-terminal',
           location: 'London',
           lat: 42.43823313018592,
           lon: -70.9849190711975
         })
    @map = assigns(:map)

    assert_response 302
    assert_redirected_to '/maps/' + @map.slug
    assert_not_equal before_count, Map.count
    assert Map.all.collect(&:name).include?('Coal terminal map')
    assert_equal @map.user.login, 'quentin'
  end

  test 'should create map if not logged in' do
    before_count = Map.count
    post(:create, map: {
           name: 'Coal terminal map',
           slug: 'coal-terminal',
           location: 'London',
           lat: 42.43823313018592,
           lon: -70.9849190711975
         })
    @map = assigns(:map)

    assert_redirected_to '/maps/' + @map.slug
    assert_not_equal before_count, Map.count
    assert Map.all.collect(&:name).include?('Coal terminal map')
    assert_nil @map.user
    assert_equal 'anonymous', @map.author
  end

  test 'assigns current user as map author if logged in' do
    before_count = Map.count
    user = users(:quentin)
    session[:user_id] = user.id
    post :create, map: {
      name: 'Yaya Center',
      slug: 'yaya-center',
      location: 'Nairobi',
      lat: -0.3030988,
      lon: 36.080026
    }
    @map = assigns(:map)

    assert_redirected_to '/maps/' + @map.slug
    assert_not_equal before_count, Map.count
    assert Map.all.collect(&:name).include?('Yaya Center')
    assert_equal user, @map.user
    assert_equal user.login, @map.author
  end

  test 'should render new if map not created' do
    skip 'images and warpable naming contradicts with rails naming convention'
    session[:user_id] = 1
    before_count = Map.count
    post(:create, map: {
           name: 'Coal terminal map',
           slug: 'coal-terminal'
         })
    @map = assigns(:map)

    assert_response :success
    assert_template :new
    assert_equal before_count, Map.count
    assert !Map.all.collect(&:name).include?('Coal terminal map')
  end

  test 'should not delete map if not owner' do
    session[:user_id] = 3
    before_count = Map.count
    post(:destroy, id: @map.slug)

    assert_redirected_to '/maps/' + @map.slug
    assert_equal flash[:error], 'Only admins or map owners may delete maps.'
    assert_equal before_count, Map.count
  end

  test 'should delete map if owner' do
    session[:user_id] = 1
    before_count = Map.count
    post(:destroy, id: @map.slug)

    assert_redirected_to '/'
    assert_not_equal before_count, Map.count
    assert_equal flash[:notice], 'Map deleted.'
  end

  test "should get show" do
    get(:show, id: @map.slug)
    assert_response :success
    assert_not_nil assigns(:map)
  end

  test 'should archive map' do
    session[:user_id] = 1
    get(:archive, id: @map.slug)
    @map.reload

    assert_redirected_to '/?_=' + Time.now.to_i.to_s
    assert @map.archived
  end

  test 'should not archive map without enough permissions' do
    session[:user_id] = 3
    get(:archive, id: @map.slug)
    @map.reload

    assert_redirected_to '/?_=' + Time.now.to_i.to_s
    assert_not @map.archived
  end

  test 'should update map' do
    session[:user_id] = 1
    put(:update,
        id: @map.slug,
        map: {
          name: 'Schrute farms',
          location: 'USA',
          lat: 44,
          lon: -74,
          description: 'A really green farm'
        },
        tags: 'beets bears')
    @map.reload

    assert_redirected_to "/maps/#{@map.slug}"
    assert_equal "Schrute farms", @map.name
    assert_equal 44, @map.lat
    assert_equal -74, @map.lon
    assert_equal 'A really green farm', @map.description
    assert @map.has_tag('beets')
    assert @map.has_tag('bears')
  end

  test 'should not update unless logged in' do
    put :update, id: 2, map: { name: 'Street 5'}
    assert_redirected_to '/login?back_to=/maps/2'
  end

  test 'should display maps by region' do
    get :region, { minlat: 40, maxlat: 50, minlon: -80, maxlon: -60 }
    @maps = assigns(:maps)

    assert_response :success
    assert @maps.collect(&:name).include?('Saugus Landfill Incinerator')
  end

  test 'displays maps by region filter by tag if present' do
    get :region, { minlat: 10, maxlat: 30, minlon: 60, maxlon: 80, tag: 'featured' }
    @maps= assigns(:maps)
    assert_response :success
    assert @maps.collect(&:name).include?('Cubbon Park')
  end

  test 'should annotate maps' do
    get :annotate, id: @map.slug
    assert_response :success
    assigns(:annotations) == true
  end

  test 'embed' do
    get :embed, id: @map.slug
    assert_response :success
    assert_template :show
  end

  test 'it returns the images' do
    get :images, id: @map.slug
    assert_response :success
    assert_equal 'application/json', response.content_type
  end

  def export_if_logged_in
    Rails.stub(:env, ActiveSupport::StringInquirer.new('development')) do
      session[:user_id] = 1
      post :export, id: @map.id, resolution: 5
      assert_response :success
      assert_equal 'complete', @response.body
    end
  end

  def export_anonmymous_map
    Rails.stub(:env, ActiveSupport::StringInquirer.new('development')) do
      map = maps(:cubbon)
      post :export, id: map.id, resolution: 5
      assert_response :success
    end
  end

  test 'returns the exports' do
    get :exports, id: @map.id
    assert_response :success
  end

  test 'license' do
    get :license
    assert_response :success
  end

  test 'featured' do
    get :featured
    assert_response :success
  end
end
