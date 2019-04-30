require 'test_helper'
class AnnotationTest < ActiveSupport::TestCase
  def setup
    @count = Annotation.count
    @annotation = annotations(:lorem)
  end

  test 'should save annotation' do
    map = maps(:saugus)
    ann = map.annotations.new
    ann.save!
    assert_equal Annotation.count, @count + 1
  end

  test 'should return author' do
    assert_equal 'quentin', @annotation.author
  end

  test 'geometry type' do
    assert_equal @annotation.geometry_type, 'Point'
  end
end
