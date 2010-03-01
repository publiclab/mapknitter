/*
Class: Graphic.SVGRenderer
	SVG Renderer Class
	
	This class implements all Graphic.AbstractRender functions.
	
  See Also:
   <AbstractRender>

   Author:
   	Sébastien Gruhier, <http://www.xilinus.com>
*/

//
// Graphic.SVGRenderer render class. 
//
Graphic.SVGRenderer = Class.create();

//
// Graphic.SVGRenderer "static" data and functions
//
Object.extend(Graphic.SVGRenderer, {
  xmlns: {
    svg:   "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink"
  },
  
  createNode:  function(nodeName) {
    return document.createElementNS(Graphic.SVGRenderer.xmlns.svg, nodeName);;
  }
})

Object.extend(Graphic.SVGRenderer.prototype, Graphic.AbstractRender.prototype);
// Keep parent initialize
Graphic.SVGRenderer.prototype._parentInitialize = Graphic.AbstractRender.prototype.initialize; 
Graphic.SVGRenderer.prototype._parentSetSize = Graphic.AbstractRender.prototype.setSize; 

Object.extend(Graphic.SVGRenderer.prototype, {
  initialize: function(element) {
    this._parentInitialize(element);
    this.element = Graphic.SVGRenderer.createNode("svg");  
    
    this.element.setAttribute("width", this.bounds.w);
    this.element.setAttribute("height", this.bounds.h);      
    this.element.setAttribute("preserveAspectRatio", "none");      
    
    this._setViewing();
    
    this.element.shape = this;     
    $(element).appendChild(this.element);
  },
  
  destroy: function() {  
    $A(this.element.childNodes).each(function(node) {
      if (node.shape) {
        node.shape.destroy();
      } else {
        node.parentNode.removeChild(node);
      }
    })
    this.element.parentNode.removeChild(this.element);
  },
  
  setSize: function(width, height) { 
    this._parentSetSize(width, height);
    this.element.setAttribute("width", this.bounds.w);
    this.element.setAttribute("height", this.bounds.h);      
    this.zoom(this.viewing.sx, this.viewing.sy)
  },
  
  createShape: function(shape){
    return Graphic.SVGRenderer.createNode(shape.nodeName);
  },
  
  add: function(shape) {      
    if (shape.parent)
      shape.parent.getRendererObject().appendChild(shape.getRendererObject());
    else
      this.element.appendChild(shape.getRendererObject());
  },

  remove:function(shape) {
    if (shape.parent) 
      shape.parent.getRendererObject().removeChild(shape.getRendererObject());
    else
      this.element.removeChild(shape.getRendererObject());
  },
  
  get: function(id) {
    var element = $(id)
    return element && element.shape ? element.shape : null;
  },
  
  shapes: function() {
    return $A(this.element.childNodes).collect(function(element) {return element.shape});
  },
  
  clear: function() {
    $A(this.element.childNodes).each(function(element)  {
      element.shape.destroy();
    })
  },
  
  updateAttributes:function(shape, attributes) {   
    $H(attributes).keys().each(function(key) {
      if (key == "href")
        shape.element.setAttributeNS(Graphic.SVGRenderer.xmlns.xlink, "href", attributes[key]); 
      else  
        shape.element.setAttribute(key, attributes[key])
    });
  },
  
  updateTransform:function(shape) {  
    if (shape.nodeName != "g")
      shape.element.setAttribute("transform", "matrix(" + shape.getMatrix().values().join(",") +  ")");
  },
  
  nbShapes: function() {
    return this.element.childNodes.length;
  },
  
  moveToFront: function(node) {
    if (this.nbShapes() > 0) {
      this.element.appendChild(node.element);
    }
  },
  
  show:function(shape) {
    shape.element.style.display = "block";
  },
  
  hide:function(shape) {
    shape.element.style.display = "none";    
  },
  
  draw: function() {
    // Nothing to do in SVG
  },
  
  pick: function(event) {
    var element = Event.element(event); 
    return element == this.element ? null : element.shape;
  },
  
  position: function() {
    if (this.offset == null)
      this.offset = Position.cumulativeOffset(this.element.parentNode);
    return this.offset;
  },
    
  addComment: function(shape, text) {
  	shape.element.appendChild(document.createComment(text));
  },                   
  
  addText: function(shape, text) {
  	shape.element.appendChild(document.createTextNode(text));
  },                   
  
  _setViewing: function() {                
    var bounds = this.viewingMatrix.multiplyBounds(this.bounds);
    this.element.setAttribute("viewBox", bounds.x + " " + bounds.y + " "  +  bounds.w + " " + bounds.h);   
  }
});

