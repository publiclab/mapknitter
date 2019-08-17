require 'test_helper'

class ExportControllerTest < ActionController::TestCase
  def setup
    @map = maps(:saugus)
  end

  def teardown
  end

  test 'should display export index' do
    get :index
    assert_response :success
    assert assigns[:exports]
    assert assigns[:day]
    assert assigns[:week]
  end

  test 'create returns json' do
    url = 'https://example.json/12345/status.json'
    post :create, params: { status_url: url }
    assert_equal url, Export.last.export_url
  end

  test 'should create jpg after export' do
    map = maps(:cubbon)
    system('mkdir -p public/warps/cubbon-park')
    system('cp test/fixtures/demo.png  public/warps/cubbon-park/cubbon-park.jpg')

    get :jpg, params: { id: map.slug}
    assert_response :success
    assert_includes 'image/jpeg', response.content_type
  end

  test 'should create geotiff after export' do
    map = maps(:cubbon)
    system('mkdir -p public/warps/cubbon-park')
    system('cp test/fixtures/demo.png public/warps/cubbon-park/cubbon-park-geo.tif')

    get :geotiff, params: { id: map.slug}
    assert_response :success
    assert_includes 'image/tiff', response.content_type
  end

  test 'should not cancel if not logged in' do
    get :cancel, params: { id: @map.id}
    assert_response :success
    assert_equal 'You must be logged in to export, unless the map is anonymous.', @response.body
    assert assigns[:map]
    assert_equal 'text/plain', @response.content_type
    assert flash.empty?
  end

  test 'should cancel export' do
    session[:user_id] = 1
    get :cancel, params: { id: @map.id}
    assert_response :success
    assert_equal 'cancelled', @response.body
    assert assigns[:map]
  end

  test 'should redirect after cancelling' do
    session[:user_id] = 1
    get :cancel, params: { id: @map.id, exports: 'cess'}
    assert_response :redirect
    assert flash.present?
    assert_redirected_to '/exports'
  end

  test 'should display export progress' do
    get :progress, params: { id: @map.id}
    assert_response :success
    assert_equal 'export not running', @response.body
    assert_equal 'text/plain', @response.content_type
  end

  test 'should display progress with no export' do
    get :progress, params: { id: 4}
    assert_response :success
    assert_equal 'export has not been run', @response.body
  end

  test 'should display progress completed' do
    get :progress, params: { id: 2}
    assert_response :success
    assert_equal 'complete', @response.body
  end

  test 'should display progress failed' do
    get :progress, params: { id: 3}
    assert_response :success
    assert_equal 'export failed', @response.body
  end

  # does not test the exporter client
  test 'should display export status' do
    session[:user_id] = 1
    get :status, params: { id: @map.id}
    assert_response :success
  end

  test 'should display error if no export' do
    session[:user_id] = 1
    get :status, params: { id: 4}
    assert_response :success
    # assert_equal { status: 'export has not been run' }.to_json, @response.body
  end
end
