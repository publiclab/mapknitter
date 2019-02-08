require 'test_helper'

class WarpableTest < ActiveSupport::TestCase
  test "basics" do
    w = warpables(:one)    
    assert_not_nil w.as_json
    assert_not_nil w.fup_json
    assert_not_nil w.fup_error_json
    assert_not_nil w.placed?
    assert w.placed?
    assert !Warpable.new.placed?
    assert_not_nil w.poly_area
    assert_not_nil w.get_cm_per_pixel

    assert_not_nil Warpable.histogram_cm_per_pixel
    assert_not_nil w.nodes
    assert_not_nil w.nodes_array
    assert_equal 4, w.nodes_array.length

    # TODO: test with local image?
    #assert_not_nil w.url()
  end

  test "try export" do
    system('mkdir -p public/system/images/1/original')
    system('cp test/fixtures/demo.png public/system/images/1/original/')
    system('mkdir -p public/warps/saugus-landfill-incinerator')
    system('touch public/warps/saugus-landfill-incinerator/folder')
    assert File.exist?('public/warps/saugus-landfill-incinerator/folder')
    w = warpables(:one)    
    assert_not_nil w.save_dimensions
    assert_not_nil w.generate_perspectival_distort(10, w.map.slug)
    assert_not_nil w.delete_temp_files(w.map.slug)
    assert_not_nil w.working_directory(w.map.slug)
    assert_not_nil w.warps_directory(w.map.slug)
    assert_not_nil w.user_id 
    assert File.exist?('public/warps/saugus-landfill-incinerator/1-geo.tif')
  end
end
