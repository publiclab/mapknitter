/*
Class: Graphic.Text
	Shape implementation of a text.

  Author:
  	Steven Pothoven

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Text = Class.create();
Object.extend(Graphic.Text.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Text.prototype._parentInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Text.prototype, {
  initialize: function(renderer) {    
    this._parentInitialize(renderer, "text");
    Object.extend(this.attributes, {x: 0, y: 0, 'font-size': '10', 'font-family': 'Veranda', 'font-weight': 'normal'});
    return this;
  },

  getSize: function() {
    return {fontSize: this.attributes['font-size'], fontWeight: this.attributes['font-weight']};
  },
  
  setSize: function(fontSize, fontWeight) {
    this._setAttributes({'font-size':  fontSize, 'font-weight': fontWeight});
    return this;
  },
    
  getLocation: function() {
    return {x: this.attributes.x, y: this.attributes.y}
  },
  
  setLocation: function(x, y) { 
    this._setAttributes({x: x, y: y});
    return this;
  },
  
  getFont: function() {
    return {fontSize: this.attributes['font-size'], fontFamily: this.attributes['font-family'], fontWeight: this.attributes['font-weight']};
  },

  setFont: function(size, family, weight) {
  	if (size) {
    	this._setAttribute('font-size',  size);
  	}
  	if (family) {
	    this._setAttribute('font-family', family);
  	}
  	if (weight) {
	    this._setAttribute('font-weight', weight);
  	}
  	return this;
  },
  
  setTextValue: function(textValue) { 
	  this.renderer.addText(this, textValue);
	  return this;
  }
})
