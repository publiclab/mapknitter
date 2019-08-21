class ConcurrentEditingChannel < ApplicationCable::Channel
  # This class handles the server side logic of the actioncable communication.

  def subscribed
    # Called first to connect user to the channel.
    stream_from "concurrent_editing_channel:#{params[:mapSlug]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def sync(changes)
    # Responsible for broadcasting the updated warpables or simply images to the user's connected on this channel.
    ActionCable.server.broadcast "concurrent_editing_channel:#{changes["map_slug"]}", changes
  end
end
