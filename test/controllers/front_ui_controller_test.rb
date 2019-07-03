require 'test_helper'

class FrontUiControllerTest < ActionController::TestCase

  # called before every single test
  def setup
  end

  # called after every single test
  def teardown
  end

  test 'should display image url for maps by region' do
    get :index
    assert_response :success
    assert assigns(:mappers)
    assert assigns(:maps)
  end
end
