/**
 * @namespace Contains functions to display raster images and distort or warp them onto a 
 * 	      geographic grid; to orthorectify them. 
 */
var Warper = {
	initialize: function() {
		document.observe('mousedown',this.mousedown.bindAsEventListener(this))
	},
	/**
	 * The images which are currently being warped. Array members are of type Warper.Image
	 * @type Array
	 */
	images: [],
	/**
	 * Click event handler - defined here because if it's in Tool.Warp, 
	 * it isn't activated unless the Warp tool is active.
	 */
	mousedown: function() {
		var inside_image = false
		Warper.images.each(function(image) {
			var inside_points = false
			image.points.each(function(point) {
				if (point.is_inside()) inside_points = true
			})
			if (inside_points || Geometry.is_point_in_poly(image.points, Map.pointer_x(), Map.pointer_y())) {
				image.active = true
				inside_image = true
			} else {
				// if you're clicking outside while it's active, and the corners have been moved:
				if (image.active && (image.coordinates() != image.old_coordinates)) {
					image.save()
				}
				if (image.active && !Tool.hover) {
					image.active = false
				}
			}	
		})
		if (inside_image) Tool.change('Warp')
		else Tool.change('Pan')
	},
	/**
	 * A function which submits all the Images in the Warper.images array
	 * to the Ruby backend for full-resolution warping.
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
	 * Creates a Warper.Image object to contain its resulting URI and 'random' coordinates.
         * Places the incoming image at Map.x, Map.y, but randomize the corners to show the
         * user that you can warp it. 
	 */
	new_image: function(url,id) {
		Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
			[Map.x-200, Map.y],
			[Map.x+400 +200*Math.random(), Map.y],
			[Map.x+400 +200*Math.random(), Map.y+200 +200*Math.random()],
			[Map.x-200, Map.y+200 +200*Math.random()]
		]),url,id))
	},
	/**
	 * Instantiates an existing image as a Warper.Image object, given an image and known points
	 * in an array of [lon,lat] pairs.
	 */
	load_image: function(url,points,id) {
		points[0][0] = Projection.lon_to_x(points[0][0])
		points[0][1] = Projection.lat_to_y(points[0][1])
		points[1][0] = Projection.lon_to_x(points[1][0])
		points[1][1] = Projection.lat_to_y(points[1][1])
		points[2][0] = Projection.lon_to_x(points[2][0])
		points[2][1] = Projection.lat_to_y(points[2][1])
		points[3][0] = Projection.lon_to_x(points[3][0])
		points[3][1] = Projection.lat_to_y(points[3][1])
		Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
			[points[0][0],points[0][1]],
			[points[1][0],points[1][1]],
			[points[2][0],points[2][1]],
			[points[3][0],points[3][1]]
		]),url,id))
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
Warper.initialize()
//= require "control_point"
//= require "image"
