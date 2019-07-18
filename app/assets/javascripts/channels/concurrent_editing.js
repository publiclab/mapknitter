App.concurrent_editing = App.cable.subscriptions.create("ConcurrentEditingChannel", {
  connected: function() {
    // Called when the subscription is ready for use on the server
    console.log("Connected");
  },

  disconnected: function() {
    // Called when the subscription has been terminated by the server
    console.log("bye");
  },

  received: function(data) {
    // Called when there's incoming data on the websocket for this channel
    window.mapKnitter.synchronizeData(data.changes);
  },

  speak: function(changes) {
    return this.perform("sync", {
        changes: changes
    });
  }
});
