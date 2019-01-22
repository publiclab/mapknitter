require 'test_helper'

class MapTest < ActiveSupport::TestCase

  test "basics" do
    map = Map.first
    assert_not_nil map.license_link
    assert_not_nil map.grouped_images_histogram(10)
  end

  test "tag basics" do
    map = Map.first
    assert !map.has_tag('test')
    assert map.add_tag('test', User.first)
    assert map.has_tag('test')
  end

end
