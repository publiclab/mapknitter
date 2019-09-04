The new synchronous editing feature
===================================

With the introduction of ActionCable to our system, it has been possible
to do perform real-time tasks quite easily. We have used rail's default
action cable to make a _concurrent_editing_channel.rb_ in the _app/channels_ folder,
to handle all the incoming requests and consists of all the business 
logic as well. At the frontend we have, _app/javascripts/channels/concurrent_editing.js_ which
handles the logic at the browser or the frontend.

## Flow of the feature:

1. When the map is updated, the _speak_ method of _concurrent_editing.js_ is called which requests 
the _sync_ method of _concurrent_editing_channel.rb_ to broadcast the updated data to 
the connected users.

2. The broadcasted data is finally caught by the _received_ function of _app/javascripts/channels/concurrent_editing.js_

3. Finally the _received_ function calls the _synchronizeData_ function to update 
 all the fresh data on the map.
 

## Testing: 

1. The _action-cable-testing_ gem is used for the feature's testing. It has some really
cool testing functionality which was required for our use case.

2. Currently we have separate tests written for connection related features and channel 
specific features. The relevant files are test/channels/concurrent_editing_channel_test.rb and
test/channels/connection_test.rb