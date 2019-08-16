require 'test_helper'

class ExporterTest < ActiveSupport::TestCase
  test 'should export warpable using isolated exporter lib' do

    # make a sample image
    system('mkdir -p public/system/images/1/original')
    system('cp test/fixtures/demo.png public/system/images/1/original/')
    system('mkdir -p public/warps/saugus-landfill-incinerator')
    system('mkdir -p public/tms/saugus-landfill-incinerator')
    system('touch public/warps/saugus-landfill-incinerator/folder')
    assert File.exist?('public/warps/saugus-landfill-incinerator/folder')

    scale = 2

    w = warpables(:one)    
    coords = Exporter.generate_perspectival_distort(scale, w.map.slug, w.nodes_array, w.id, w.image_file_name, w.image, w.height, w.width)
    assert coords
    assert Exporter.get_working_directory(w.map.slug)
    assert Exporter.warps_directory(w.map.slug)

    map = maps(:saugus)

    # get rid of existing geotiff
    system('rm -r public/warps/saugus-landfill-incinerator/1-geo.tif')
    # make a sample image
    system('mkdir -p public/system/images/2/original/')
    system('cp test/fixtures/demo.png public/system/images/2/original/test.png')
    origin = Exporter.distort_warpables(scale, map.warpables, map.export, map.slug)
    lowest_x, lowest_y, warpable_coords = origin
    assert origin
    ordered = false

    system('mkdir -p public/warps/saugus-landfill-incinerator')
    system('mkdir -p public/tms/saugus-landfill-incinerator')
    # these params could be compressed - warpable coords is part of origin; are coords and origin required?
    assert Exporter.generate_composite_tiff(warpable_coords, origin, map.placed_warpables, map.slug, ordered)
    assert Exporter.generate_tiles('', map.slug, Rails.root.to_s)
    assert Exporter.zip_tiles(map.slug)
    assert Exporter.generate_jpg(map.slug, Rails.root.to_s)
    resolution = 20
    assert Exporter.run_export(User.last, resolution, map.export, map.id, map.slug, Rails.root.to_s, map.average_scale, map.placed_warpables, '')

    # test deletion of the files; they were already deleted in run_export, so let's make sample ones:
    # make a sample image
    system('mkdir -p public/system/images/2/original/')
    system('touch public/system/images/2/original/test.png')
    system('mkdir -p public/warps/saugus-landfill-incinerator')
    system('mkdir -p public/tms/saugus-landfill-incinerator')
    system('touch public/warps/saugus-landfill-incinerator/folder')
    assert File.exist?('public/warps/saugus-landfill-incinerator/folder')
    system('mkdir -p public/warps/saugus-landfill-incinerator-working')
    system('touch public/warps/saugus-landfill-incinerator/test.png')
    assert Exporter.delete_temp_files(w.map.slug)
  end
end

