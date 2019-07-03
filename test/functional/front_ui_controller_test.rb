require 'test_helper'

class FrontUiControllerTest < ActionController::TestCase

  def setup
  end

  def teardown
  end

  test 'should display image url for maps by region' do
    get :index
    assert_response :success
    assert assigns(:mappers)
    assert assigns(:maps)
  end

  test 'gallery page' do
    get :gallery

    assert assigns(:maps)
    assert assigns(:authors)
    assert_response :success
    assert_template 'front_ui/gallery'
  end
end
