require 'test_helper'

module ApplicationCable
  class ConcurrentEditingChannelTest < ActionCable::Channel::TestCase

    def test_synch_editing_broadcast_count
      channel_name = "concurrent_editing_channel"
      assert_broadcasts channel_name, 0
      ActionCable.server.broadcast channel_name, data: {}
      assert_broadcasts channel_name, 1
    end


    def test_synch_editing_broadcast_message
      channel_name = "concurrent_editing_channel"
      changes = { :image_change => "test" }
      ActionCable.server.broadcast channel_name, data: changes
      assert_broadcast_on(channel_name, data: changes) do
        ActionCable.server.broadcast channel_name, data: changes
      end
    end
  end
end
