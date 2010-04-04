/**
 * @namespace Contains functions to display raster images and distort or warp them onto a 
 * 	      geographic grid; to orthorectify them. 
 */
var Warper = {
	initialize: function() {
		// heinous, but we really do need 
		Glop.observe('glop:postdraw', this.draw.bindAsEventListener(this))
		Glop.observe('mousedown',this.mousedown.bindAsEventListener(this))
	},
	/**
	 * The images which are currently being warped. Array members are of type Warper.Image
	 * @type Array
	 */
	images: [],
	locked: false,
	active_image: false,
	sort_images: function() {
		Warper.images.sort(Warper.sort_by_area)
	},
	/**
	 * Compared two ways based on area
	 * @param {Warper.Image} a
	 * @param {Warper.Image} b
	 */
	sort_by_area: function(a,b) {
		if ( a.area < b.area ) return 1;
		if ( a.area > b.area ) return -1;
		return 0; // a == b
	},
	draw: function() {
		Warper.images.each(function(image){ image.draw() })
	},
	/**
	 * Click event handler - defined here because if it's in Tool.Warp, 
	 * it isn't activated unless the Warp tool is active.
	 */
	mousedown: function() {
		if (!Warper.locked) {
		var inside_image = false
		for (i=Warper.images.length-1;i>=0;i--){
			var image = Warper.images[i]
			if (image.is_inside()) {
				if (!inside_image) {
					Warper.images.each(function(image){image.deselect()})
					Warper.active_image = image
					image.select()
					inside_image = true
				}
			} else {
				// if you're clicking outside while it's active, and the corners have been moved:
				if (image.active && (image.coordinates() != image.old_coordinates)) {
					image.save()
				}
				if (image.active && !Tool.hover) {
					image.deselect()
				}
			}
		}
		if (Warper.active_image) {
			var point_clicked = false
			Warper.active_image.points.each(function(point) {
				if (point.is_inside()) {
					Warper.active_image.select_point(point)
					point_clicked = true
				}
			})
			if (!point_clicked && Warper.active_image.active_point) {
				Warper.active_image.active_point.deselect()
			}
		}
		if (inside_image) {
			// 'true' forces a change, in case you have an image selected and are selecting a second one
			Tool.change('Warp',true)
		}
		else if (!Tool.hover) Tool.change('Pan')
		}
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
			[Map.x-100/Map.zoom, Map.y],
			[Map.x+100/Map.zoom +(100/Map.zoom)*Math.random(), Map.y],
			[Map.x+100/Map.zoom +(100/Map.zoom)*Math.random(), Map.y+100/Map.zoom +(50/Map.zoom)*Math.random()],
			[Map.x-100/Map.zoom, Map.y+100/Map.zoom +(50/Map.zoom)*Math.random()]
		]),url,id))
	},
	/**
	 * Instantiates an existing image as a Warper.Image object, given an image and known points
	 * in an array of [lon,lat] pairs.
	 */
	load_image: function(url,points,id,locked) {
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
		Warper.images.last().locked = locked
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
document.observe('cartagen:init',Warper.initialize.bindAsEventListener(Warper))
//= require "control_point"
//= require "image"
