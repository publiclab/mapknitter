class ConcurrentEditingChannel < ApplicationCable::Channel
  def subscribed
    stream_from "concurrent_editing_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def sync changes
    ActionCable.server.broadcast 'concurrent_editing_channel', changes
  end
end
