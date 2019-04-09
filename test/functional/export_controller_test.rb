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

  #stored in public path which is git ignored
 # test "jpg" do
   # get :jpg, id: @map.slug
   # assert_response :success
   # assert_includes '"image/jpeg', response.content_type
 # end

 # test "geotiff" do
   # get :geotiff, id: @map.slug
   # assert_response :success
   # assert_includes '"image/tiff', response.content_type
 # end

  # arbitrary exports
  test "export" do
    ids = [Warpable.first, Warpable.last].join(',') # does it accept a string?
    get :export, image_ids: ids, resolution: 20, slug: 'unique-slug' # but this could overwrite an existing map, unfortunately... 
    # we should check uniqueness unless you're an admin
    assert_response :success
  end

  test "cancel fails if not logged in" do
    get :cancel, id: @map.id
    assert_response :success
    assert_equal "You must be logged in to export, unless the map is anonymous.", @response.body
    assert assigns[:map]
    assert_equal 'text/html', @response.content_type
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
