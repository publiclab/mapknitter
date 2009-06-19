/**
 * @namespace Collection of functions for doing geometric calculations
 */
var Geometry = {
	/**
	 * Finds the centroid of a polygon
	 * @param {Node[]} polygon Array of nodes that make up the polygon
	 * @return A tuple, in [x, y] format, with the coordinates of the centroid
	 * @type Number[]
	 */
	poly_centroid: function(polygon) {
		var n = polygon.length
		var cx = 0, cy = 0
		var a = Geometry.poly_area(polygon,true)
		var centroid = []
		var i,j
		var factor = 0
		
		for (i=0;i<n;i++) {
			j = (i + 1) % n
			factor = (polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y)
			cx += (polygon[i].x + polygon[j].x) * factor
			cy += (polygon[i].y + polygon[j].y) * factor
		}
		
		a *= 6
		factor = 1/a
		cx *= factor
		cy *= factor
		centroid[0] = cx
		centroid[1] = cy
		return centroid
	},
	/**
	 * Calculates the sides of the smallest possible box that holds all the specified points.
	 * Used to calculate the bounding box of a polygon.
	 * @param {Node[]} points Array of nodes
	 * @return Bounding box, in [y1, x1, y2, x2] format
	 * @type Number[]
	 */
	calculate_bounding_box: function(points) {
		var bbox = [0,0,0,0] // top, left, bottom, right
		points.each(function(node) {
			if (node.x < bbox[1] || bbox[1] == 0) bbox[1] = node.x
			if (node.x > bbox[3] || bbox[3] == 0) bbox[3] = node.x
			if (node.y < bbox[0] || bbox[0] == 0) bbox[0] = node.y
			if (node.y > bbox[2] || bbox[2] == 0) bbox[2] = node.y
		})
		return bbox
	},
	/**
	 * Determines if a point is withing a certain distance of another.
	 * @param {Number} x1    X-coordinate of the first point
	 * @param {Number} y1    Y-coordinate of the first point
	 * @param {Number} x2    X-coordinate of the second point
	 * @param {Number} y2    Y-coordinate of the second point
	 * @param {Number} fudge Maximum distance between the points
	 * @return True if the points are closer than the specified fudge distance, else false
	 * @type Boolean
	 */
	overlaps: function(x1,y1,x2,y2,fudge) {
		if (x2 > x1-fudge && x2 < x1+fudge) {
			if (y2 > y1-fudge && y2 < y1+fudge) {
		  		return true
			} else {
				return false
			}
		} else {
			return false
		}
	},
	/**
	 * Determines if two boxes overlap, given their sides.
	 * @param {Number} box1top
	 * @param {Number} box1left
	 * @param {Number} box1bottom
	 * @param {Number} box1right
	 * @param {Number} box2top
	 * @param {Number} box2left
	 * @param {Number} box2bottom
	 * @param {Number} box2right
	 * 
	 * @return True if the boxes overlap, else false
	 * @type Boolean
	 */
	intersect: function(box1top,box1left,box1bottom,box1right,box2top,box2left,box2bottom,box2right) {
		return !(box2left > box1right || box2right < box1left || box2top > box1bottom || box2bottom < box1top)
	},
	/**
	 * Determines of a point is in a polygon. This should be rewritten at some point, as the source
	 * is really nasty.
	 * @param {Node[]} poly Array of nodes that make up the polygon
	 * @param {Number} x    X-coordinate of the point to check for
	 * @param {Number} y    Y-coordinate of the point to check for
	 * 
	 * @return True if the point is inside the polygon, else false
	 * @type Boolean
	 * 
	 * @author Jonas Raoni Soares Silva <a href="http://jsfromhell.com/math/is-point-in-poly">
	 *         http://jsfromhell.com/math/is-point-in-poly</a>
	 */
	is_point_in_poly: function(poly, x, y){
	    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
	        ((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y))
	        && (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
	        && (c = !c);
	    return c;
	},
	/**
	 * Finds the area of a polygon
	 * @param {Node[]}  nodes    Array of nodes that make up the polygon 
	 * @param {Boolean} [signed] If true, returns a signed area, else returns a positive area.
	 *                           Defaults to false.
	 * @return Area of the polygon
	 * @type Number
	 */
	poly_area: function(nodes, signed) {
		var area = 0
		nodes.each(function(node,index) {
			if (index < nodes.length-1) next = nodes[index+1]
			else next = nodes[0]
			if (index > 0) last = nodes[index-1]
			else last = nodes[nodes.length-1]
			area += last.x*node.y-node.x*last.y+node.x*next.y-next.x*node.y
		})
		if (signed) return area/2
		else return Math.abs(area/2)
	}
}