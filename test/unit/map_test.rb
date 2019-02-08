require 'test_helper'

class MapTest < ActiveSupport::TestCase

  test "basics" do
    assert_not_nil Map.bbox(0,0,90,180)
    assert_not_nil Map.authors
    assert_not_nil Map.new_maps

    map = Map.first
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
    assert_not_nil map.anonymous?

    assert_not_nil map.images_histogram
    assert_not_nil map.grouped_images_histogram(10)
    assert_not_nil map.nearby_maps(100) # in degrees lat/lon
  end

  test "export functions" do
    map = Map.first
    assert_not_nil map.average_scale
    assert_not_nil map.placed_warpables
    assert_not_nil map.best_cm_per_pixel
    assert_not_nil map.exporting?
    assert_not_nil map.export
    assert_not_nil map.latest_export
    assert_not_nil map.nodes
    assert_not_nil map.average_cm_per_pixel

    assert_not_nil map.run_export(users(:quentin), map.average_cm_per_pixel)

    # main issue will be that it creates and continuously updates an Export model. 
    # we could shift this to a polling model, either on the client side (eliminating the Export model)
    # ... or some other way to make it possible to do many of these tasks without needing ActiveRecord

    # let's start at the bottom and factor this all out working upwards

    # refactor so that we pass in as much in parameters as possible, reducing in-model cross-references

      # creates an Export and sets initial values
      # depends on: map.average_scale
      # runs self.distort_warpables(pxperm)
      # runs self.generate_composite_tiff(warpable_coords,origin)
      # runs `identify` and assigns some values (height, width) to Export
      # runs export.tms = true if self.generate_tiles
      # runs export.zip = true if self.zip_tiles
      # runs export.jpg = true if self.generate_jpg
    # map.distort_warpables(scale)
      # collects self.placed_warpables
      # runs on each one: warpable.generate_perspectival_distort(scale,self.slug)
    # map.generate_composite_tiff(coords,origin)
      # collects self.placed_warpables
      # runs gdal_warp on the output of each, flattening onto a single geotiff
    # map.generate_tiles
      # runs on composite tiff output: gdal2tiles = 'gdal2tiles.py -k -t "'+self.slug+'" -g "'+google_api_key+'" '+Rails.root.to_s+'/public/warps/'+self.slug+'/'+self.slug+'-geo.tif '+Rails.root.to_s+'/public/tms/'+self.slug+"/"
    # map.zip_tiles
    # map.generate_jpg
      # runs convert on composite tiff

  end

  test "tag basics" do
    map = Map.first
    assert !map.has_tag('test')
    assert map.add_tag('test', User.first)
    assert map.has_tag('test')
  end

end
