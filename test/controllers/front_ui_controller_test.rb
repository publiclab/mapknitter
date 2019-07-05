require 'test_helper'

class FrontUiControllerTest < ActionController::TestCase

  def setup
    @map = maps(:saugus)
  end

  def teardown
  end

  test 'should display image url for maps by region' do
    get :index
    assert_response :success
    assert assigns(:mappers)
    assert assigns(:maps)
    assert_template 'front_ui/index'
  end

  test 'gallery page' do
    get :gallery

    assert assigns(:maps)
    assert assigns(:authors)
    assert_response :success
    assert_template 'front_ui/gallery'
  end

  test 'nearby mappers' do
    session[:lat] = -1.2920
    session[:lon] = 36.8219

    get :nearby_mappers
    assert_response :success
    assert assigns(:nearby_maps)
    assert assigns(:nearby_mappers)
    assert_template 'front_ui/nearby_mappers'
  end

  test 'search map by location' do
    get :location, params: { loc: 'India'}, xhr: true
    @maps = assigns(:maps)

    assert_response :success
    assert !@maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert @maps.collect(&:name).include?('Cubbon Park')
  end

  test 'view map page' do
    map = maps(:saugus)
    get :view_map, id: map.slug

    assert_response :success
    assert assigns(:mappers)
    assert_template 'front_ui/view_map'
  end
end
