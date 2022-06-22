require 'test_helper'

class MapTest < ActiveSupport::TestCase

  test 'should not have empty default attributes' do
    assert_not_nil Map.bbox(0,0,90,180)
    assert_not_nil Map.authors
    assert_not_nil Map.new_maps
  end

  test 'should create map' do
    map = maps(:saugus)

    assert_not_nil map.license_link
    assert_not_nil map.author
    assert_not_nil map.name
    assert_not_nil map.created_at
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
    assert_not_nil map.private
    assert_not map.anonymous?
    assert_not_nil map.images_histogram
    assert_not_nil map.grouped_images_histogram(10)
    assert_not_nil map.nearby_maps(100) # in degrees lat/lon
    assert Map.first.validate
    assert_equal Map.count, Map.new_maps.size
  end

  test 'should export map related functions' do
    map = maps(:saugus)
    assert_not_nil map.average_scale

    placed = map.warpables(&:placed?)
    
    assert_not_nil map.placed_warpables
    assert_equal placed, map.placed_warpables
    assert_not_nil map.best_cm_per_pixel
    assert_not_nil map.exporting?
    assert_not_nil map.export
    assert_not_nil map.latest_export
    assert_not_nil map.nodes
    assert_not_nil map.average_cm_per_pixel
  end

  test 'should have histograms' do
    map = maps(:saugus)
    hist = map.images_histogram

    assert_not_nil hist
    assert_not_nil map.grouped_images_histogram(3)
    assert_equal hist.count/3, map.grouped_images_histogram(3).count
  end

  test 'should have nearby maps' do
    map = maps(:nairobi)
    near_maps = map.nearby_maps(5)

    assert_not_nil near_maps
    assert_includes near_maps, maps(:village)

    saugus = maps(:saugus)
    saugus.lat = 0

    assert_empty saugus.nearby_maps(100)
  end

  test 'should create tag basics in map' do
    map = Map.first

    assert !map.has_tag('test')
    assert map.add_tag('test', User.first)
    assert map.has_tag('test')
  end

  test 'anonymous' do
    map = Map.create(name: 'Nakuru', lat: '-0.3030988', lon: '36.080026', location: 'Kenya' )

    assert_includes(Map.anonymous, map)
    assert map.anonymous?
  end

  test 'filter bbox with tag if present' do
    maps =  Map.bbox(-5,35,0,40,'featured')
    assert maps.collect(&:name).include?('Nairobi City')
  end

  test 'bbox without tag returns results' do
    maps =  Map.bbox(40,-80,50,-60)
    assert maps.collect(&:name).include?('Saugus Landfill Incinerator')
  end

  test 'should spam map' do
    map = maps(:saugus)
    assert_equal Map::Status::NORMAL, map.status
    map.spam
    assert_equal Map::Status::BANNED, map.status
  end
end
