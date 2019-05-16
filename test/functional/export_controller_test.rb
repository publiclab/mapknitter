require 'test_helper'

class ExportControllerTest < ActionController::TestCase

  def setup
    @map = maps(:saugus)
  end

  def teardown
  end

  test "index" do
    get :index
    assert_response :success
    assert assigns[:exports]
    assert assigns[:day]
    assert assigns[:week]
  end

  test "jpg" do
    map = maps(:cubbon)
    system('mkdir -p public/warps/cubbon-park')
    system('cp test/fixtures/demo.png  public/warps/cubbon-park/cubbon-park.jpg')

    get :jpg, id: map.slug
    assert_response :success
    assert_includes '"image/jpeg', response.content_type
  end

  test "geotiff" do
    map = maps(:cubbon)
    system('mkdir -p public/warps/cubbon-park')
    system('cp test/fixtures/demo.png public/warps/cubbon-park/cubbon-park-geo.tif')

    get :geotiff, id: map.slug
    assert_response :success
    assert_includes '"image/tiff', response.content_type
  end

  test "cancel fails if not logged in" do
    get :cancel, id: @map.id
    assert_response :success
    assert_equal "You must be logged in to export, unless the map is anonymous.", @response.body
    assert assigns[:map]
    assert_equal 'text/plain', @response.content_type
    assert flash.empty?
  end

  test "cancels export" do
    session[:user_id] = 1
    get :cancel, id: @map.id
    assert_response :success
    assert_equal 'cancelled', @response.body
    assert assigns[:map]
  end

  test "exports cancelled if present" do
    session[:user_id] = 1
    get :cancel, id: @map.id, exports: 'cess'
    assert_response :redirect
    assert flash.present?
    assert_redirected_to '/exports'
  end

  test "progress" do
    get :progress, id: @map.id
    assert_response :success
    assert_equal 'export not running', @response.body
    assert_equal 'text/html', @response.content_type
  end
end
