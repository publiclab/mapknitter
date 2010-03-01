/*
Class: Graphic
	Used for namespace and for generic function about rendering and browser
	
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Graphic = Class.create();

// Group: Class Methods       
Object.extend(Graphic, {
  functionMustBeOverriden: {
    name: 'functionMustBeOverriden',
    message: 'This function is an abstract function and must be overriden'
  },
  
  /* 
     Function:  rendererSupported
       Checks if a renderer is supported by the browser and by the framework

     Parameters:
       name - renderer name (VML, SVG or Canvas)
       
     Returns:
       true/false
  */
  rendererSupported: function(name) {  
    switch(name) {
      case "VML":
        return Prototype.Browser.IE;
      case "SVG":
        return ! (Prototype.Browser.IE || Prototype.Browser.WebKitVersion < 420);   
        // THIS DOES NOT WORK!!
        // $A(navigator.mimeTypes).each(function(m){console.log(m.type)})
        // if (navigator.mimeTypes != null && navigator.mimeTypes.length > 0)
        //   return navigator.mimeTypes["image/svg+xml"];
        // return false;
      case "Canvas":
        try {
          return document.createElement("canvas").getContext("2d") != null;
        }
        catch(e) {
          return false;
        }
      default:     
        throw "Renderer " + name + " not supported"
        return null;
    }
  }
});             
