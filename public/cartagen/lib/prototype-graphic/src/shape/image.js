/*
Class: Graphic.Image
	Shape implementation of an image. 

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Graphic.Image = Class.create();
Object.extend(Graphic.Image.prototype, Graphic.Rectangle.prototype);

// Keep parent initialize
Graphic.Image.prototype._shapeInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Image.prototype, {
  initialize: function(renderer, image) {
    this._shapeInitialize(renderer, "image");
    Object.extend(this.attributes, {x:0, y:0, width:0, height:0});
    return this;
  },
  
  // Group: Specific Image Functions
  /*
    Function: setSource
      Sets image source
      
    Parameters:
      url      - image url
      autoSize - Set width and height from image (default false)
      
    Returns:
      this
  */
  setSource: function(url, autoSize) {       
    if (autoSize) {
      this.image = new Image(); 
      this.image.src= url;  
      Event.observe(this.image, "load",function() {   
        this.setSize(this.image.width, this.image.height);
        this._setAttribute('href', url);  
      }.bind(this));
    }
    else
      this._setAttribute('href', url);  
    return this;
  }
});