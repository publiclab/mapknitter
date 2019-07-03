require 'test_helper'
class AnnotationTest < ActiveSupport::TestCase
  def setup
    @count = Annotation.count
    @annotation = annotations(:lorem)
  end

  test 'should save an annotation' do
    map = maps(:saugus)
    ann = map.annotations.new
    ann.save!

    assert_equal Annotation.count, @count + 1
  end

  test 'should return an author' do
    assert_equal 'quentin', @annotation.author
  end

  test 'should retrieve a geometry type' do
    @annotation.annotation_type = 'Some random Geometry'
    assert_equal @annotation.geometry_type, 'Point'

    @annotation.annotation_type = 'polyline'
    assert_equal @annotation.geometry_type, 'LineString'

    @annotation.annotation_type = 'polygon'
    assert_equal @annotation.geometry_type, 'Polygon'

    @annotation.annotation_type = 'rectangle'
    assert_equal @annotation.geometry_type, 'Polygon'
  end
end
