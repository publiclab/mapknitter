/*
Class: Graphic.HighlightTool
	Select/Move tool.
	
	Register this tool to be able to highlight any shape. 
  
  Author:
  	Steven Pothoven

  License:
  	MIT-style license.

  See Also:
    <Tool>, <EventNotifier>
*/
Graphic.HighlightTool = Class.create();
Object.extend(Graphic.HighlightTool.prototype, Graphic.Tool.prototype);
Object.extend(Graphic.HighlightTool.prototype, {
  /*
    Function: initialize
      creates the current tool
     
    Parameters:
      groupId - optional containing group to limit events to (only shapes within this group are notified of event)
      
  */
  initialize: function(groupId) {  
    this.renderer = null;
    this.shape    = null;
    this.groupId = groupId;   
  },
  
  /*
    Function: activate
      Activates the current tool
     
    Parameters:
      manager - tool manager
      
  */
  activate: function(manager) {
    this.renderer = manager.renderer;
  },
  
  /*
    Function: unactivate
      Unactivates the current tool
     
    Parameters:
      manager - tool manager
      
  */
  unactivate: function(manager) {
    this.renderer = null;
  }, 

  /*
    Function: click
      Called by tool manager on a click
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  click: function(x, y, event) {
    this.shape = this.renderer.pick(event);
    if (this.shape) {
    	// if no container group is specified or this shape is within the specified containing group
    	if (!this.groupId || $A($(this.groupId).childNodes).indexOf(this.shape.element) != -1) {
			EventNotifier.send(this, "shapeHasBeenClicked", {shape: this.shape, x: Event.pointerX(event), y: Event.pointerY(event)});
    	}
    }
  },
  
  /*
    Function: click
      Called by tool manager on a double click
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  doubleClick: function(x, y, event) {
    this.shape = this.renderer.pick(event);
    if (this.shape) {
    	// if no container group is specified or this shape is within the specified containing group
    	if (!this.groupId || $A($(this.groupId).childNodes).indexOf(this.shape.element) != -1) {
			EventNotifier.send(this, "shapeHasBeenDoubleClicked", {shape: this.shape, x: Event.pointerX(event), y: Event.pointerY(event)});
    	}
    }
  },
  
  /*
    Function: mouseOver
      Called by tool manager on a mouse over

    Parameters:  
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      

  */
  mouseOver: function(x, y, event) {
    this.shape = this.renderer.pick(event);
    if (this.shape) {
    	// if no container group is specified or this shape is within the specified containing group
    	if (!this.groupId || $A($(this.groupId).childNodes).indexOf(this.shape.element) != -1) {
			switch (this.shape.element.nodeName) {
				case 'line':
				case 'polyline':
				case 'shape':
				case 'text':
					var originalItemColor = this.shape.getStroke();
					break;
				default:
					var originalItemColor = this.shape.getFill();
			}
			// getFill returns a string in the format "rgb(r,g,b)" or "none"
			if (originalItemColor.indexOf("rgb") == 0) {
				// this needs to be made into an associative array {r, g, b}
				//
				// strip leading 'rgb(' and trailing ')'
				originalItemColor = originalItemColor.substring(4, originalItemColor.length - 1);
				// split up the elements
				originalItemColor = originalItemColor.split(',');
				originalItemColor = {r: originalItemColor[0], g: originalItemColor[1], b: originalItemColor[2]};
				// preserve any opacity setting as well		
				originalItemColor.a = (this.shape.getFillOpacity() * 255);
				// preserve any width setting as well		
				originalItemColor.w = (this.shape.getStrokeWidth());
				Graphic.HighlightTool.highlightColor.w = this.shape.getStrokeWidth();
			}
			this.shape.originalItemColor = originalItemColor;
			switch (this.shape.element.nodeName) {
				case 'line':
				case 'polyline':
				case 'shape':
				case 'text':
					this.shape.setStroke(Graphic.HighlightTool.highlightColor);
					break;
				default:
					this.shape.setFill(Graphic.HighlightTool.highlightColor);
			}
			this.renderer.draw();
			EventNotifier.send(this, "shapeHasBeenHighlighted", {shape: this.shape, x: Event.pointerX(event), y: Event.pointerY(event)});
    	}
    }
  },

  /*
    Function: mouseOut
      Called by tool manager on a mouse out

    Parameters:  
      event - browser mouse event      

  */
  mouseOut: function(event) {
    this.shape = this.renderer.pick(event);
    if (this.shape) {
    	// if no container group is specified or this shape is within the specified containing group
    	if (!this.groupId || $A($(this.groupId).childNodes).indexOf(this.shape.element) != -1) {
			switch (this.shape.element.nodeName) {
				case 'line':
				case 'polyline':
				case 'shape':
				case 'text':
					this.shape.setStroke(this.shape.originalItemColor);
					break;
				default:
					this.shape.setFill(this.shape.originalItemColor);
			}
			this.renderer.draw();
			EventNotifier.send(this, "shapeHasBeenUnHighlighted", {shape: this.shape});
	    	}
	    }
  }
});

// default highlight color
Graphic.HighlightTool.highlightColor = {r: 204, g: 227, b: 255, a: 0}; // #CCE5FF