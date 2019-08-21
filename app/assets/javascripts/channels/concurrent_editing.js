/* Handles all the frontend interactions with action cable and the server.  */

App.concurrent_editing = App.cable.subscriptions.create(
    {
        channel: "ConcurrentEditingChannel",
        mapSlug: window.location.href.split("/").pop()
    }, {
  connected: function() {
    // Called when the subscription is ready for use on the server
  },

  disconnected: function() {
    // Called when the subscription has been terminated by the server
  },

  received: function(data) {
    // Called when there's incoming data on the websocket for this channel
    window.mapknitter.synchronizeData(data.changes);
  },

  speak: function(changes) {
   /* Called when an image is updated from Map.js ('saveImage' function).
    *  This function calls concurrent_editing_channel.rb's 'sync' method
    *  which is responsible for broadcasting the updated warpables
    *  to all the user's connected to the concurrent_editing channel. */
    return this.perform("sync", {
        changes: changes,
        map_slug: window.location.href.split("/").pop()
    });
  }
});
