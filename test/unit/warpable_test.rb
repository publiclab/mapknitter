require 'test_helper'

class WarpableTest < ActiveSupport::TestCase

  def setup
    @warp = warpables(:one)
    @map = maps(:saugus)
  end

  test 'should have basic warpable attributes' do
    assert_equal "demo.png", @warp.image_file_name
    assert_equal "image/png", @warp.image_content_type
    assert_equal 392, @warp.height
    assert_equal 756, @warp.width
    assert_equal '', @warp.history
    assert_equal false, @warp.locked
    assert_equal false, @warp.deleted
    assert_equal 500, @warp.cm_per_pixel
    assert_equal "1,2,3,4", @warp.nodes
  end

  test 'should output json format methods' do
    assert_not_nil @warp.as_json
    assert_equal Hash, @warp.as_json.class
    assert_equal @warp.attributes.size + 2, @warp.as_json.size

    assert_not_nil @warp.fup_json
    assert_equal Hash, @warp.fup_json.class
    assert_equal 8, @warp.fup_json.size

    assert_not_nil @warp.fup_error_json
    assert_equal Hash, @warp.fup_error_json.class
    assert_equal 3, @warp.fup_error_json.size
  end

  test 'should execute warpable small methods' do
    assert_not_nil @warp.placed?
    assert @warp.placed?
    assert_equal false, Warpable.new.placed?

    assert_not_nil @warp.poly_area
    assert_not_nil @warp.get_cm_per_pixel
    assert_equal Float, @warp.get_cm_per_pixel.class
    assert_equal 100, Warpable.histogram_cm_per_pixel.length

    node_count =  @warp.nodes.split(',').length
    assert_not_nil @warp.nodes_array
    assert_equal node_count, @warp.nodes_array.length

    assert_not_nil @warp.user_id
    assert_equal @warp.map.user_id, @warp.user_id

    Warpable.delete_all
    assert_empty Warpable.histogram_cm_per_pixel
  end

  test 'should try export warpables' do
    # make a sample image
    system('mkdir -p public/warps/saugus-landfill-incinerator-working')
    system('mkdir -p public/system/images/1/original')
    system('cp test/fixtures/demo.png public/system/images/1/original/')
    system('mkdir -p public/warps/saugus-landfill-incinerator')
    system('touch public/warps/saugus-landfill-incinerator/folder')
    system('mkdir -p public/system/images/2/original/')
    system('cp test/fixtures/demo.png public/system/images/2/original/test.png')
    system('cp test/fixtures/demo.png public/warps/saugus-landfill-incinerator/1-geo.tif')
    assert File.exist?('public/warps/saugus-landfill-incinerator/folder')

    origin = Exporter.distort_warpables(2,
                                        @map.warpables,
                                        @map.export,
                                        @map.slug)

    assert_not_nil @warp.save_dimensions
    assert_not_nil @warp.user_id

    Exporter.generate_composite_tiff(nil,
                                     origin,
                                     @map.placed_warpables,
                                     @map.slug,
                                     false)

    assert File.exist?('public/warps/saugus-landfill-incinerator/1-geo.tif')
  end
end
