require 'test_helper'

class FrontUiHelperTest < ActionView::TestCase
  def setup
    @user = users(:quentin)
    @maps = Map.all
  end

  test 'should return profile_image' do
    last_image = @user.warpables.last.image
    assert_equal last_image.url, profile_image(@user)
  end

  test 'should return anonymous maps' do
    assert_equal @maps.anonymous, anonymous(@maps)
  end

  test 'should return featured maps' do
    assert_equal @maps.featured, featured(@maps)
  end
end
