require 'test_helper'

class MapTest < ActiveSupport::TestCase

  test "basics" do
    map = Map.first
    assert_not_nil map.license_link
    assert_not_nil map.grouped_images_histogram(10)
    assert_not_nil map.author
    assert_not_nil map.name
    assert_not_nil map.slug
    assert_not_nil map.lat
    assert_not_nil map.lon
    assert_not_nil map.location
    assert_not_nil map.description
    assert_not_nil map.zoom
    assert_not_nil map.license
    assert_not_nil map.exports
    assert_not_nil map.tags
    assert_not_nil map.comments
    assert_not_nil map.user
  end

  test "tag basics" do
    map = Map.first
    assert !map.has_tag('test')
    assert map.add_tag('test', User.first)
    assert map.has_tag('test')
  end

end
