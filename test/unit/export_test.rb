require 'test_helper'

class ExportTest < ActiveSupport::TestCase
  test "count methods" do
    assert_not_nil Export.average_cm_per_pixel
    assert_not_nil Export.histogram_cm_per_pixel
    assert_not_nil Export.histogram_cm_per_pixel_in_tens
    assert_not_nil Export.export_count
    assert_not_nil Export.exporting
  end

  test "export running" do
    assert !Export.last.running?
  end
end
