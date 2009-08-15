/**
 * @namespace Stores information about the current viewport
 */
var Viewport = {
	/**
	 * Frame to show bbox culling
	 * @type Number
	 */
	padding: 0,
	/**
	 * Bbox in [y1, x1, y2, x2] format
	 * @type Number[]
	 */
	bbox: [],
	/**
	 * Bbox in [[x,y],[x,y],[x,y],[x,y]] format, clockwise from top left
	 * @type Array[]
	 */
	full_bbox: function() {
		return [[this.bbox[1],this.bbox[0]],[this.bbox[3],this.bbox[0]],[this.bbox[3],this.bbox[2]],[this.bbox[1],this.bbox[2]]]
	},
	/**
	 * X-width of the viewport
	 * @type Number
	 */ 
	width: 0,
	/**
	 * Y-height of the viewport
	 */
	height: 0,
	/**
	 * Yields the x,y of the nearest Viewport corner in an array as [x,y,corner] where corner is 0,1,2,3 clockwise from top left
	 * 
	 * @param {Number} x  x-coordinate of query
	 * @param {Number} y  y-coordinate of query
	 */
	nearest_corner: function(x,y) {
		var corner = []
		if (Math.abs(Viewport.bbox[1] - x) < Math.abs(Viewport.bbox[3] - x)) {
			corner[0] = Viewport.bbox[1]
			corner[2] = 0
		} else {
			corner[0] = Viewport.bbox[3]
			corner[2] = 1
		}
		if (Math.abs(Viewport.bbox[0] - y) < Math.abs(Viewport.bbox[2] - y)) {
			corner[1] = Viewport.bbox[0]
		} else {
			corner[1] = Viewport.bbox[2]
			corner[2] -= 1
			corner[2] *= -1 // swap 1 and 0
			corner[2] += 2
		}
		return corner
	},
	/**
	 * Yields the integer index of the nearest Viewport side, as 0,1,2, or 3
	 * where top=0,right=1,bottom=2,left=3
	 * 
	 * @param {Number} x  x-coordinate of query
	 * @param {Number} y  y-coordinate of query
	 */
	// nearest_side: function(x,y) {
	// 	if ()
	// 	return side
	// },
	/**
	 * Varies around 1.0 as function of hardware resolution. This assumes that resolution is
	 * somewhat proportianal to power, which is generally true. This should eventually be replaced
	 * with something that measures initial load speed in fps to get a better estimate.
	 * @type Number
	 */
	power: function() {
		return window.screen.width/1024
	},
	/**
	 * Performs per-frame setup functions such as resizing the viewport to match the containing 
	 * window or element. Also generates Viewport.bbox
	 */
	draw: function() {
		Viewport.width = Glop.width * (1 / Map.zoom) - (2 * Viewport.padding * (1 / Map.zoom))
        Viewport.height = Glop.height * (1 / Map.zoom) - (2 * Viewport.padding * (1 / Map.zoom))
        // culling won't work anymore after we fixed rotation... everything's got to be square.
        if (Map.rotate != 0) {
			Viewport.width = Math.sqrt(Math.pow(Math.max(Viewport.width, Viewport.height),2)*2)
	   		Viewport.height = Viewport.width
		}
		Viewport.bbox = [Map.y - Viewport.height / 2, Map.x - Viewport.width / 2, Map.y + Viewport.height / 2, Map.x + Viewport.width / 2]
        // $C.stroke_rect(Map.x-Viewport.width/2,Map.y-Viewport.height/2,Viewport.width,Viewport.height)
	}
}
