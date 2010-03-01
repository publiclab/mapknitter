/*
Class: EventNotifier
	Singleton to send messages to any observers.
	
	To receive message, you just need to register an object as observer.
	You can observe messages from any objects or for a specific object. 
	
	All messages will receive two parameters :
	- sender object
	- options (hash table or object)
	
	Sample Code  
	> myObserver =  {
  >   shapeHasBeenMoved: function(sender, options) {
  >     console.log(options)
  >   }
  > }
  > EventNotifier.addObserver(myObserver)
  
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
EventNotifier = {
  observers: new Array(),
  
  /*
    Function: addObserver
      Registers a new object as observer
      
    Parameters:
      observer - Observer (should implement message function to be notified)
      sender   - Sender object (default:null) If not null, observer will only received message from this object
  */
  addObserver: function(observer, sender) {
    sender = sender || null;
    this.removeObserver(observer);
    this.observers.push({observer:observer, sender:sender});
  },
  
  /*
    Function: removeObserver
      Unregisters an observer
      
    Parameters:
      observer - Observer 
  */
  removeObserver: function(observer) {  
    this.observers = this.observers.reject( function(o) { return o.observer == observer });
  },
  
  /*
    Function: send
      Send a new message to all registered observers
      
    Parameters:
      sender    - Sender object (can be null)
      eventName - Event name (observers have to implement this method)
      options   - Object or Hash table (for multiple options) of sending event  (default null)
  */
  send: function(sender, eventName, options) {  
    options = options || null;
    this.observers.each( function(o) {
      if ((o.sender == null || o.sender == sender) && o.observer[eventName]) 
        o.observer[eventName](sender, options);
    });
  }
}