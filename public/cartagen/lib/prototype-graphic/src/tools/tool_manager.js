/*
Class: Graphic.ToolManager
	Class to handle mouse event for any tools.
	Just initialize a tool manager on a renderer and set your a tool (setTool)
 
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Tool>
*/
Graphic.ToolManager = Class.create();
Graphic.ToolManager.prototype = {    
  initialize: function(renderer) {
    this.renderer = renderer;
    this.element = renderer.element.parentNode;
    this.currentTool = null;
    
    this.eventMappings = $A([ [this.element, "mousedown", this.mouseDown],
    						              [this.element, "click",     this.click],
    						              [this.element, "dblclick",  this.doubleClick],
    						              [document,     "mousemove", this.mouseMove],
    						              [document,     "mouseup",   this.mouseUp],
    						              [document,     "keyup",     this.keyUp],
    						              [document,     "keydown",   this.keyDown],
    						              [this.element, "mouseover", this.mouseOver],
    						              [this.element, "mouseout",  this.mouseOut]
    						              ]);

    this.eventMappings.each(function(eventMap) { 
      eventMap.push(eventMap[2].bindAsEventListener(this))
    	Event.observe($(eventMap[0]), eventMap[1], eventMap[3]);
     }.bind(this));
    this.offset = Position.cumulativeOffset(this.element);  
    this.dimension = $(this.element).getDimensions();
  },

  destroy: function() {
    this.currentTool.unactivate();
    this.currentTool = null;
   
    // Remove event listeners
    this.eventMappings.each(function(eventMap) {
   	  Event.stopObserving($(eventMap[0]), eventMap[1], eventMap[3]);
    });
    this.eventMappings.clear();
  },

  setRenderer: function(renderer) {
    this.renderer = renderer;
    this.setTool(this.currentTool);  
  },
  
  setTool: function(tool) {
    if (this.currentTool && this.currentTool.unactivate)
      this.currentTool.unactivate(this);
      
    this.currentTool = tool;
    
    if (this.currentTool && this.currentTool.activate)
      this.currentTool.activate(this);    
  },
  
  getTool: function() {
    return this.currentTool;
  },
  
  doubleClick: function(event) {   
    if (this.currentTool == null)
      return;
   
    this.offset = Position.page(this.element);   
    var x = this._getX(event); 
    var y = this._getY(event);
    this.currentTool.doubleClick(x, y, event);
    
    Event.stop(event);
  },
  
  click: function(event) {   
    if (this.currentTool == null)
      return;
   
    this.offset = Position.page(this.element);   
    var x = this._getX(event); 
    var y = this._getY(event);
    this.currentTool.click(x, y, event);
    
    Event.stop(event);
  },
  
  mouseDown: function(event) {   
    if (this.currentTool == null)
      return;

    if (!Event.isLeftClick(event))
      return; 
      
    this.offset = Position.page(this.element);  
    this.xi = this._getX(event);
    this.yi = this._getY(event);
    
    this.xlast = this.xi;
    this.ylast = this.yi;

    this.currentTool.initDrag(this.xi, this.yi, event);
    this.isDragging = true;
    disableSelection();
    Event.stop(event);
  },
  
  mouseMove: function(event) { 
    if (this.currentTool == null)
      return;
    var x = this._getX(event); 
    var y = this._getY(event);
    if (this.isDragging) {
      var dx = x - this.xi;
      var dy = y - this.yi;
      var ddx = x - this.xlast;
      var ddy = y - this.ylast;
     
      var org = this.renderer.viewingMatrix.multiplyPoint(0, 0);
      var pt = this.renderer.viewingMatrix.multiplyPoint(ddx, ddy);
      ddx =  pt.x - org.x;
      ddy =  pt.y - org.y;

      var pt = this.renderer.viewingMatrix.multiplyPoint(dx, dy); 
      dx =  pt.x - org.x;
      dy =  pt.y - org.y;
      
      this.xlast = x;
      this.ylast = y;
      this.currentTool.drag(x, y, dx, dy, ddx, ddy, event);
    } 
    else
      if (this.currentTool.mouseMove)
        this.currentTool.mouseMove(x, y, event);
    
    Event.stop(event);
  },
  
  mouseUp: function(event) {
    if (this.currentTool == null)
      return;

    if (!this.isDragging)
      return false;
      
    var x = this._getX(event); 
    var y = this._getY(event);

    this.isDragging = false;
    this.currentTool.endDrag(x, y, event);
    enableSelection();
    Event.stop(event);
  },
  
  keyUp: function(event) {    
    if (this.currentTool == null)
     return;

    var keyCode = event.keyCode || event.which
    if (this.currentTool.keyUp(keyCode, event))
      Event.stop(event);
  },

  keyDown: function(event) {     
    if (this.currentTool == null)
     return;

    var keyCode = event.keyCode || event.which
    if (this.currentTool.keyDown(keyCode, event))
      Event.stop(event);
  },
  
  mouseOver: function(event) {   
    if (this.currentTool == null)
      return;
    
    var x = this._getX(event); 
    var y = this._getY(event);

    this.currentTool.mouseOver(x, y, event);
    Event.stop(event);
  },
  
  mouseOut: function(event) {   
    if (this.currentTool == null)
      return;
    
    this.currentTool.mouseOut(event);
    Event.stop(event);
  },
  
  scrollX: function() {
    var page = Position.page(this.element);       
    var offset = Position.cumulativeOffset(this.element);
    return offset[0] - page[0];
  },
  
  scrollY: function() {
    var page = Position.page(this.element);       
    var offset = Position.cumulativeOffset(this.element);
    return offset[1] - page[1];
  },
  
  _getX: function(event) {
    this.dimension = $(this.element).getDimensions();
    var scroll = getWindowScroll(window);
    var x = Event.pointerX(event) - this.offset[0] - scroll.left;    
    if (x < 0)
      x = 0;
    if (x > this.dimension.width)
      x = this.dimension.width;   
    return x;
  },
  
  _getY: function(event) {
    this.dimension = $(this.element).getDimensions();
    var scroll = getWindowScroll(window);    
    var y = Event.pointerY(event) - this.offset[1] - scroll.top;    
    if (y < 0)
      y = 0;
    if (y > this.dimension.height)
      y = this.dimension.height;   
    return y;
  }
}

