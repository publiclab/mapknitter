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
	new_image: function(url) {
		// consider prompting upload with a form
		// and calling this function on success of form submission
		
		// Place the incoming image at Map.x, Map.y
		Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
			[Map.x-200, Map.y],
			[Map.x+400 +200*Math.random(), Map.y],
			[Map.x+400 +200*Math.random(), Map.y+200 +200*Math.random()],
			[Map.x-200, Map.y+200 +200*Math.random()]
		]),url))
		
	},
	/**
	 * Convenience method to present points as objects with .x and .y values instead of [x,y]
	 */
	p: function(point) {
		if (point.x == undefined) {
			x = point[0]
			y = point[1]
		} else {
			x = point.x
			y = point.y
		}
		return '(' + x + ', ' + y + ')'
	},
	getProjectiveTransform: function(points) {
	  var eqMatrix = new Matrix(9, 8, [
	    [ 1, 1, 1,   0, 0, 0, -points[2].x,-points[2].x,-points[2].x ], 
	    [ 0, 1, 1,   0, 0, 0,  0,-points[3].x,-points[3].x ],
	    [ 1, 0, 1,   0, 0, 0, -points[1].x, 0,-points[1].x ],
	    [ 0, 0, 1,   0, 0, 0,  0, 0,-points[0].x ],

	    [ 0, 0, 0,  -1,-1,-1,  points[2].y, points[2].y, points[2].y ],
	    [ 0, 0, 0,   0,-1,-1,  0, points[3].y, points[3].y ],
	    [ 0, 0, 0,  -1, 0,-1,  points[1].y, 0, points[1].y ],
	    [ 0, 0, 0,   0, 0,-1,  0, 0, points[0].y ]

	  ]);

	  var kernel = eqMatrix.rowEchelon().values;
	  var transform = new Matrix(3, 3, [
	    [-kernel[0][8], -kernel[1][8], -kernel[2][8]],
	    [-kernel[3][8], -kernel[4][8], -kernel[5][8]],
	    [-kernel[6][8], -kernel[7][8],             1]
	  ]);
	  return transform;
	}
	
}

//= require "control_point"
//= require "image"