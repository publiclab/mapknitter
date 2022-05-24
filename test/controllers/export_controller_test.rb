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

  # does not test the exporter client
  test 'should display export status' do
    session[:user_id] = 1
    get :status, params: { id: @map.id}
    assert_response :success
  end
end
