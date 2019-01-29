require 'test_helper'

class TagTest < ActiveSupport::TestCase

  test "basics" do
    tag = Tag.first
    assert_not_nil tag.name
    assert_not_nil tag.maps
  end

end
