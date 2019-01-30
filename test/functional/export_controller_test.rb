require 'test_helper'

class ExportControllerTest < ActionController::TestCase

  test "index" do
    get :index
    assert_response :success
    assert assigns[:exports]
    assert assigns[:day]
    assert assigns[:week]
  end

# we can't test these until we generate the files
#  test "jpg" do
#    get :jpg, id: Map.first.slug
#    assert_response :success
#  end

#  test "geotiff" do
#    get :geotiff, id: Map.first.slug
#    assert_response :success
#  end

  test "cancel fails if not logged in" do
    get :cancel, id: Map.first.id
    assert_response :success
    assert_equal "You must be logged in to export, unless the map is anonymous.", @response.body
    assert assigns[:map]
    # this is not right, needs rewriting:
    # assert_not_equal "canceled", Map.first.exports.last.status
  end

  test "cancel" do
    session[:user_id] = 1
    get :cancel, id: Map.first.id
    assert_response :success
    assert_equal 'cancelled', @response.body
    assert assigns[:map]
    # this is not right, needs rewriting:
    # assert_equal "canceled", Map.first.exports.last.status
  end

  test "progress" do
    get :progress, id: Map.first.id
    assert_response :success
    assert_equal 'export not running', @response.body
    #  if  export.status == 'complete'
    #    output = 'complete'
    #  elsif export.status == 'none'
    #    output = 'export not running'
    #  elsif export.status == 'failed'
    #    output = 'export failed'
    #    output = export.status
    #  output = 'export has not been run'
  end
end
