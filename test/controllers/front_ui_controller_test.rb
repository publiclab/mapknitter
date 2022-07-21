require 'test_helper'

class FrontUiControllerTest < ActionController::TestCase

  def setup
  end

  def custom_setup
    @map = maps(:nairobi)
    @map.spam
    @map.user.ban
  end

  def teardown
  end

  test 'should display all featured mappers on the home page' do
    get :index
    @maps = assigns(:mappers)

    assert_response :success
    assert assigns(:mappers)
    assert assigns(:maps)
    assert_equal 1, @maps.length
    assert_template 'front_ui/index'
  end

  test 'should exclude banned users from the featured mappers on the home page' do
    custom_setup
    get :index
    @maps = assigns(:mappers)

    assert_response :success
    assert assigns(:mappers)
    assert_equal 0, @maps.length
    assert_template 'front_ui/index'
  end

  test 'gallery page' do
    get :gallery

    assert assigns(:maps)
    assert assigns(:authors)
    assert_response :success
    assert_template 'front_ui/gallery'
  end

  test 'should display nearby maps and nearby mappers' do
    session[:lat] = -1.2920
    session[:lon] = 36.8219

    get :nearby_mappers
    @nearby_maps = assigns(:nearby_maps)
    @nearby_mappers = assigns(:nearby_mappers)

    assert_response :success
    assert assigns(:nearby_maps)
    assert assigns(:nearby_mappers)
    assert_equal 3, @nearby_maps.length
    assert_equal 2, @nearby_mappers.length
    assert_template 'front_ui/nearby_mappers'
  end

  test 'should exclude spammed maps and banned users from nearby maps and nearby mappers' do
    custom_setup
    session[:lat] = -1.2920
    session[:lon] = 36.8219

    get :nearby_mappers
    @nearby_maps = assigns(:nearby_maps)
    @nearby_mappers = assigns(:nearby_mappers)

    assert_response :success
    assert_equal 2, @nearby_maps.length
    assert_equal 1, @nearby_mappers.length
    assert_template 'front_ui/nearby_mappers'
  end

  test 'should search map by location' do
    get :location, params: { loc: 'India'}, xhr: true
    @maps = assigns(:maps)

    assert_response :success
    assert !@maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert @maps.collect(&:name).include?('Cubbon Park')
  end

  test 'should exclude spammed maps from location search results' do
    get :location, params: { loc: 'Kenya' }, xhr: true
    @maps = assigns(:maps)
    assert_equal 3, @maps.length
    assert @maps.collect(&:name).include?('Nairobi City')

    custom_setup
    get :location, params: { loc: 'Kenya' }, xhr: true
    @maps = assigns(:maps)

    assert_response :success
    assert_equal 2, @maps.length
    assert_not @maps.collect(&:name).include?('Nairobi City')
  end

  test 'should not display archived maps' do
    @map = maps(:saugus)
    session[:user_id] = 1
    @map.update(archived: true, status: Map::Status::BANNED)
    get :gallery
    @maps = assigns(:maps)

    assert_response :success
    assert_not @maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert @maps.collect(&:name).include?('Cubbon Park')
    assert @maps.collect { |map| map.user&.login }.include?('quentin')
  end

  test 'should get maps gallery' do
    get :gallery
    @maps = assigns(:maps)

    assert_response :success
    assert @maps.collect(&:name).include?('Saugus Landfill Incinerator')
    assert @maps.collect(&:name).include?('Cubbon Park')
    assert @maps.collect(&:name).include?('Nairobi City')
    assert @maps.collect { |map| map.user&.login }.include?('quentin')
    assert @maps.collect { |map| map.user&.login }.include?('aaron')
  end

  test 'should exclude spammed maps and banned users from gallery' do
    custom_setup
    get :gallery
    @maps = assigns(:maps)

    assert_response :success
    assert_not @maps.collect(&:name).include?('Nairobi City')
    assert_not @maps.collect { |map| map.user&.login }.include?('aaron')
  end

end
