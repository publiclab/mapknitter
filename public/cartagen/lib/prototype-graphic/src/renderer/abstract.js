/*
Class: Graphic.AbstractRender
	Abstract Renderer Class
	
	This class should not be used directly, just as an new renderer parent class.
	
	It lists all function that a renderer should implement.
		
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>
*/
Graphic.AbstractRender = Class.create();
Graphic.AbstractRender.prototype = {
  /*
    Function: initialize
      Constructor. 
      
    Returns:
      A new renderer
  */
  initialize: function(element) {        
    var dimension = $(element).getDimensions();

    this.viewing = {tx:0, ty: 0, sx: 1, sy:1, cx: dimension.width/2, cy: dimension.height/2};   
    this._setViewMatrix();
    this.bounds  = {x: 0, y:0, w: dimension.width, h: dimension.height};                        
    return this;
  },
     
  
  /*
    Function: pan
      Pans current viewing. 
      
    Parameters:
      x - x shift value
      y - y shift value
      
    Returns:
      this
  */
  pan: function(x, y) {
    this.viewing.tx = x;
    this.viewing.ty = y;
    this._setViewMatrix();
    this._setViewing();  
    return this;
  },
  
  /*
    Function: zoom
      Zooms current viewing. 
      
    Parameters:
      sx - x scale value
      sy - y scale value
      cx - x center (default renderer center)
      cy - y center (default renderer center)   
      
    Returns:
      this
  */
  zoom: function(sx, sy, cx, cy) {
    this.viewing.sx = sx;
    this.viewing.sy = sy;  
    this.viewing.cx = cx || this.bounds.w/2;
    this.viewing.cy = cy || this.bounds.h/2;  
    this._setViewMatrix();
    this._setViewing();  
    return this;
  },

  /*
    Function: getViewing
      Gets current viewing. 
      
    Returns:
      An hash {tx:, ty:, sx:, sy:, cx:, cy:}
  */
  getViewing: function() {
    return this.viewing;
  },
    
  /*
    Function: setViewing
      Sets current viewing. 
      
    Parameters:
      An hash {tx:, ty:, sx:, sy:, cx:, cy:}
      
    Returns:
      this
  */
  setViewing: function(viewing) {
    this.viewing = Object.extend(this.viewing, viewing);
    this._setViewMatrix();
    this._setViewing();  
    
    return this;
  },
    
  _setViewMatrix: function() {
    this.viewingMatrix = Matrix.translate(this.viewing.tx, this.viewing.ty).multiplyLeft(Matrix.scaleAt(1/this.viewing.sx, 1/this.viewing.sy, this.viewing.cx, this.viewing.cy));     
  },
      
  /*
    Function: setSize
      Sets current renderer size
      
    Parameters:
      width  - renderer width
      height - renderer height
      
    Returns:
      this
  */
  setSize: function(width, height) {
    this.bounds.w = width;
    this.bounds.h = height;          
    
    return this;
  },
  
  /*
    Function: getSize
      Gets current renderer size
            
    Returns:
      An hash {width:, height:}
  */
  getSize: function() {
    return {width: this.bounds.w, height: this.bounds.h};
  },
  
  /*
    Function: destroy
      Destructor. Should clean DOM and memory
  */
  destroy: function()                {console.log("Graphic.AbstractRender:destroy")},
  
  /*
    Function: createShape
      Creates a new shape. 
      
    Parameters:
      type - Shape type (like rect, ellipse...)
      
    Returns:
      A new object handling renderer information for drawing the shape
  */
  createShape: function(type)        {console.log("Graphic.AbstractRender:createShape")},
  
  /*
    Function: add
      Adds a new shape to be displayed. 
    Parameters:
      shape -  Shape object to be added
      parent - Parent Shape object for the added shape, used for grouping shapes.
               if null (default value) the shape is added as child of the renderer
      
     See Also:
      <Shape>
  */   
  add: function(shape, parent)       {console.log("Graphic.AbstractRender:add")},

  /*
    Function: remove
      Removes a shape from rendering
      
    Parameters:
      shape - Prototype Grpahic Shape object to be removed
      parent - Parent Shape object for the removed shape, used when grouping shapes.
               if null (default value) the shape is removed as child of the renderer
      
     See Also:
      <Shape>
  */   
  remove:function(shape, parent)     {console.log("Graphic.AbstractRender:remove")},
  
  /*
    Function: get
      Gets a shape from an ID
      
    Parameters:
      id - shape id
      
    Returns:
      A shape or null
      
    See Also:
      <Shape>
  */   
  get:function(id)                   {console.log("Graphic.AbstractRender:get")},
  
  /*
    Function: shapes
      Gets all shapes of the renderer
      
    Parameters:
      
    Returns:
      A array of shapes or null
      
    See Also:
      <Shape>
  */   
  shapes:function(id)                {console.log("Graphic.AbstractRender:shapes")},
  
  /*
    Function: clear
      Clears all shapes from rendering
  */   
  clear:function()                   {console.log("Graphic.AbstractRender:clear")},
  
  /*
    Function: updateAttributes
      Updates shape attributes. Called when a shape has been modified like fill color or 
      specific attributes like roundrect value 
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  updateAttributes:function(shape, attributes)  {console.log("Graphic.AbstractRender:update")},

  /*
    Function: updateTransform
      Updates shape transformation. Called when a shape transformation has been modified like rotation, translation...
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  updateTransform:function(shape)    {console.log("Graphic.AbstractRender:updateTransform")},
  
  /*
    Function: nbShapes
      Gets nb shapes displayed in the renderer
      
    Returns:
      int value
      
     See Also:
      <Shape>
  */   
  nbShapes: function()               {console.log("Graphic.AbstractRender:nbShapes")},
  
  /*
    Function: show
      Shows a shape. The shape should have been added to the renderer before
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  show:function(shape)               {console.log("Graphic.AbstractRender:show")},    
  
  /*
    Function: hide
      Hides a shape. The shape should have been added to the renderer before
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  hide:function(shape)               {console.log("Graphic.AbstractRender:hide")},
  
  /*
    Function: moveToFront
      Changes shape z-index order to be display above all other shapes
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  moveToFront: function(shape)       {console.log("Graphic.AbstractRender:moveToFront")},
  
  /*
    Function: draw
      Performs shape rendering. 
  */   
  draw: function()                   {console.log("Graphic.AbstractRender:draw")},
  
  /*
    Function: position
      Gets top-left renderer position
      
    Returns:
      An array of 2 values (x, y)
      
     See Also:
      <Shape>
  */   
  position: function()               {console.log("Graphic.AbstractRender:position")},
  
  /*
    Function: pick
      Gets shape for a mouse event 
      
    Returns:
      null or first shape under mouse position
      
     See Also:
      <Shape>
  */   
  pick: function(event)              {console.log("Graphic.AbstractRender:pick")},       
  
  addComment: function(shape, text) {},

  addText: function(shape, text)     {console.log("Graphic.AbstractRender:addText")},
  
  _setViewing: function()            {console.log("Graphic.AbstractRender:_setViewing")}   
}