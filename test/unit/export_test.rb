require 'test_helper'

class ExportTest < ActiveSupport::TestCase
  test 'should count methods' do
    average = Export.all.map(&:cm_per_pixel).sum/Export.count
    assert_not_nil Export.average_cm_per_pixel
    assert_equal average, Export.average_cm_per_pixel
    assert_not_nil Export.histogram_cm_per_pixel
    assert_not_nil Export.histogram_cm_per_pixel_in_tens
    assert_not_nil Export.export_count
    assert_not_nil Export.exporting

    Export.delete_all
    assert_empty Export.histogram_cm_per_pixel
    assert_equal 0, Export.average_cm_per_pixel
  end

  test 'should export running' do
    assert !Export.last.running?
  end
end
