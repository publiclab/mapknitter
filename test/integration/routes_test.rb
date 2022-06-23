require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest

  test "test single-spam-map route" do
    assert_routing({ path: '/moderate/spam_map/1', method: :patch }, { controller: 'spam', action: 'spam_map', id: '1' })
  end

  test "test batch-spam-maps route" do
    assert_routing({ path: '/moderate/batch_spam_map/1,2', method: :patch }, { controller: 'spam', action: 'batch_spam_map', ids: '1,2' })
  end
end
