/*
Class: Graphic.Tool
	Abstract class used by Graphic.ToolManager.
	
	Any tools used by Graphic.ToolManager should implemented those methods

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <ToolManager>
*/
Graphic.Tool = Class.create();
Graphic.Tool.prototype = { 
  /*
    Function: activate
      Activates the current tool
     
    Parameters:
      manager - tool manager
      
  */
  activate: function(manager) {},
  
  /*
    Function: unactivate
      Unactivates the current tool
     
    Parameters:
      manager - tool manager
      
  */
  unactivate: function(manager) {}, 

  /*
    Function: clear
      Clears the current tool
     
    Parameters:
      manager - tool manager
      
  */
  clear: function(manager) {},
  
  /*
    Function: initDrag
      Called by tool manager to start a drag session (mouse down on a shape)
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  initDrag: function(x, y, event) {},
  
  /*
    Function: drag
      Called by tool manager on mouse drag
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      dx - x delta since the init drag
      dx - y delta since the init drag
      ddx - x delta since the last drag
      ddx - y delta since the last drag
      event - browser mouse event
  */
  drag: function(x, y, dx, dy, ddx, ddy, event) {},
  
  /*
    Function: endDrag
      Called by tool manager to end a drag session (mouse up on a shape)
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  endDrag: function(x, y, event) {},

  /*
    Function: mouseMove
      Called by tool manager on mouseMove (not called while draggin)
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */              
  
  mouseMove: function(x, y, event) {},                             
  
  /*
    Function: click
      Called by tool manager on a click
       
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  click: function(x, y, event) {},
  
  /*
    Function: doubleClick
      Called by tool manager on a double click
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  doubleClick: function(x, y, event) {},

  /*
    Function: keyUp
      Called by tool manager on a key up
     
    Parameters:  
      keyCode - key code 
      event   - browser key event    
      
    Returns: 
      true if tool handle key, else false
  */
  keyUp: function(keyCode, event) {},  
  
  /*
    Function: keyDown
      Called by tool manager on a key up
     
    Parameters:  
      keyCode - key code 
      event   - browser key event    
      
    Returns: 
      true if tool handle key, else false
  */
  keyDown: function(keyCode, event) {},

  /*
    Function: mouseOver
      Called by tool manager on a mouse over

    Parameters:  
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      

  */
  mouseOver: function(x, y, event) {},

  /*
    Function: mouseOut
      Called by tool manager on a mouse out

    Parameters:  
      event - browser mouse event      

  */
  mouseOut: function(event) {}
}
