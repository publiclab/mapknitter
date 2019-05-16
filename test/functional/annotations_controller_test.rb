require 'test_helper'

class AnnotationsControllerTest < ActionController::TestCase
  # called before every single test
  def setup
    @map = maps(:saugus)
    @annotation = annotations(:one)
  end

  # called after every single test
  def teardown
  end

  test "should create annotation if logged in " do
    before_count = @map.annotations.count
    session[:user_id] = 1
    post :create,
         {
           format: :json,
           map_id: 1,
           annotation: {
             properties: {
               annotation_type: 'polyline',
               textContent: 'Some cool text'
             },
             geometry: { coordinates: [10, 33] }
           }
         }

    @map.reload
    assert_response 302
    assert_not_equal before_count, @map.annotations.count
    assert_redirected_to map_annotation_url(@map, @map.annotations.last)
  end

  test "should create annotation if not logged in " do
    before_count = @map.annotations.count
    post :create,
         {
           format: :json,
           map_id: 1,
           annotation: {
             properties: {
               annotation_type: 'polyline',
               textContent: 'Some cool text'
             },
             geometry: { coordinates: [10, 33] }
           }
         }

    @map.reload
    assert_response 302
    assert_not_equal before_count, @map.annotations.count
    assert_redirected_to map_annotation_url(@map, @map.annotations.last)
  end

  # test 'should show annotations' do
  #   get :show, map_id: 1, id: @annotation.id

  #   assert_response 200
  #   assert_includes @response.body, @annotation.text
  # end

  test 'should update annotations' do
  end

  test 'should destroy annotations' do
  end

  # test 'should display index' do
  #   get :index, map_id: 1
  #   assert_response :success
  #   assert_includes @response.body, @annotation.text
  # end
end
