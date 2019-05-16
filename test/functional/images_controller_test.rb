require 'test_helper'

class ImagesControllerTest < ActionController::TestCase

  # called before every single test
  def setup
    @map = maps(:saugus)
    @warp = warpables(:one)

    @file ||= File.open(File.expand_path(Rails.root + 'test/fixtures/demo.png', __FILE__))
    @uploaded_data = ActionDispatch::Http::UploadedFile.new(tempfile: @file, filename: File.basename(@file), type: "image/png")
  end

  def teardown
  end

  test 'fetch locally should redirect to url' do
    get :fetch, url: '/maps'
    assert_response :redirect
    assert_redirected_to '/maps'
  end

  def fetch_in_production
    Rails.stub(:env, ActiveSupport::StringInquirer.new('production')) do
      get :fetch, url: '/maps'
      assert_response :success
      assert_equal data, response.body
      assert_equal 'text/html', response.content_type
    end
  end

  test 'create uploads an image' do
    before_count = Warpable.count

    post :create, map_id: @map.id, uploaded_data: @uploaded_data
    assert_response :success
    assert_equal before_count+1, Warpable.count
  end

  test 'should return correct status and type on create' do
    post :create, map_id: @map.id, uploaded_data: @uploaded_data

    assert_equal 200, response.status
    assert_equal "text/html", response.content_type
  end

  test 'should show the image' do
    get :show, id: @warp.id, format: 'json'
     json_response = JSON.parse(response.body)
     assert_equal @warp.id, json_response["id"]
     assert_response :success
  end

  test 'should update an image' do
    session[:user_id] = 1
    points = "-71.39,41.83:-71.39,41.83:-71.39,41.83:-71.39,41.83"
    put :update, id: @map.id, warpable_id: @warp.id, locked: false, points: points
    assert_not_nil @warp.nodes
    assert_equal "text/plain", response.content_type
  end

  test 'correct user should destroy an image' do
    session[:user_id] = 1
    delete :destroy, id: @warp.id
    assert_response :redirect
    assert_redirected_to "/maps/#{@map.slug}"
  end

  test 'redirects to login if attempt destroy and not logged in' do
    delete :destroy, id: @warp.id
    assert_response :redirect
    assert_redirected_to '/login'
    assert_not_nil flash[:error]
  end
end
