/**
 * @namespace Contains functions to display raster images and distort or warp them onto a 
 * 	      geographic grid; to orthorectify them. 
 */
var Warper = {
	/**
	 * The images which are currently being warped. Array members are of type Warper.Image
	 * @type Array
	 */
	images: [],
	/**
	 * A function which submits all the Images in the Warper.images array to the Ruby backend for full-resolution warping.
	 */
	flatten: function() {
		new Ajax.Request('/warper/warp', {
		  method: 'get',
		  parameters: {
			images: Warper.images,
		  },
		  onSuccess: function(response) {
			// Should respond with a URL for a complete image, or a tileset.
			// Display the resulting image or tileset and prompt to trace.
		  }
		});
	},
	/**
	 * A function which prompts the user for an image file, uploads it, and creates a 
	 * Warper.Image object to contain its resulting URI and default coordinates.
	 */
	new_image: function() {
		// consider prompting upload with a form
		// and calling this function on success of form submission
		
	}
}

//= require "control_point"
//= require "image"