require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest

  test "test single-spam-map route" do
    assert_routing({ path: '/moderate/spam_map/1', method: :patch }, { controller: 'spam', action: 'spam_map', id: '1' })
  end

  test "test batch-spam-maps route" do
    assert_routing({ path: '/moderate/batch_spam_maps/1,2', method: :patch }, { controller: 'spam', action: 'batch_spam_maps', ids: '1,2' })
  end

  test "test single-publish-map route" do
    assert_routing({ path: '/moderate/publish_map/2', method: :patch }, { controller: 'spam', action: 'publish_map', id: '2' })
  end

  test "test batch-publish-maps route" do
    assert_routing({ path: '/moderate/batch_publish_maps/1,2', method: :patch }, { controller: 'spam', action: 'batch_publish_maps', ids: '1,2' })
  end

  test "test batch-delete-maps route" do
    assert_routing({ path: '/moderate/batch_delete_maps/3,4', method: :delete }, { controller: 'spam', action: 'batch_delete_maps', ids: '3,4' })
  end

  test "test single-ban-user route" do
    assert_routing({ path: '/moderate/ban_user/1', method: :patch }, { controller: 'spam', action: 'ban_user', id: '1' })
  end

  test "test batch-ban-users route" do
    assert_routing({ path: '/moderate/batch_ban_users/1,2', method: :patch }, { controller: 'spam', action: 'batch_ban_users', ids: '1,2' })
  end

  test "test single-unban-user route" do
    assert_routing({ path: '/moderate/unban_user/1', method: :patch }, { controller: 'spam', action: 'unban_user', id: '1' })
  end

  test "test batch-unban-users route" do
    assert_routing({ path: '/moderate/batch_unban_users/1,2', method: :patch }, { controller: 'spam', action: 'batch_unban_users', ids: '1,2' })
  end

  test "test filter-maps route" do
    assert_routing({ path: '/moderate/filter_maps/updated', method: :get }, { controller: 'spam', action: 'filter_maps', type: 'updated' })
  end

  test "test filter-users route" do
    assert_routing({ path: '/moderate/filter_users/active', method: :get }, { controller: 'spam', action: 'filter_users', type: 'active' })
  end
end
