require 'application_system_test_case'

class SynchronousTest < ApplicationSystemTestCase
  setup do
    Capybara.current_driver = Capybara.javascript_driver
    Capybara.asset_host = "http://localhost:3000"
  end

  test 'warpables change flow' do
    map = maps(:saugus)
    original_data = map.fetch_map_data
    map.warpables.first.update_column(:nodes, "2,5,1,3")
    updated_data = map.fetch_map_data
    assert_not_equal updated_data, original_data
  end
end