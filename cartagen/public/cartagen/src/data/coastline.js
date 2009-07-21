var Coastline = {
	/**
	 * Returns an array of points (corners) along the edge of the Viewport from the start param to the end param.
	 * Params are integers where corner is 0,1,2,3 clockwise from top left. Returns as [[x,y],[x,y]...]
	 * @param {Array} start The corner to begin the walk.
	 * @param {Array} end The corner to walk to.
	 */
	walk: function(start,end,clockwise) {
		if (Object.isUndefined(clockwise)) clockwise = true
		$l(start+'/'+end+',clockwise '+clockwise+': '+this.walk_n(start,end,clockwise))
		debugger
		var nodes = []
		var bbox = Viewport.full_bbox()
		// if (clockwise == false) bbox = bbox.reverse()
		// this doesn't make sense:
		if (clockwise) {
			if (start >= end) var slice_end = bbox.length
			else var slice_end = end+1
			var cycle = bbox.slice(start,slice_end) // path clockwise to walk around the viewport
			if ((start > end) || (start == end && start > 0)) cycle = cycle.concat(bbox.slice(0,end+1)) //loop around from 3 back to 0
		} else {
			//this is all fucked up:
			if (start <= end) var slice_end = bbox.length
			else var slice_end = start+1
			// if (end > 0) end -= 1
			var cycle = bbox.slice(end,slice_end) // path clockwise to walk around the viewport
			if ((start < end) || (start == end && end > 0)) cycle = cycle.concat(bbox.slice(0,start+1)) //loop around from 3 back to 0
			cycle = cycle.reverse()
		}
		cycle.each(function(coord,index) {
			nodes.push([coord[0],coord[1]])
			// if (clockwise) nodes.push([coord[0],coord[1]])
			// else nodes.unshift([coord[0],coord[1]])

			// $C.line_to(coord[0],coord[1])

			// $C.save()
			// $C.opacity(1)
			// $C.fill_style('black')
			// $C.rect(coord[0]-15,coord[1]-15,30,30)
			// $C.draw_text("Helvetica",40,'white',coord[0]-20,coord[1]-20,index)
			// $C.restore()
		})
		return nodes
	},
	walk_n: function(start,end,clockwise) {
		if (Object.isUndefined(clockwise)) clockwise = true
		var nodes = []
		var bbox = [0,1,2,3]//Viewport.full_bbox()
		// if (clockwise == false) bbox = bbox.reverse()
		// this doesn't make sense:
		if (clockwise) {
			if (start >= end) var slice_end = bbox.length
			else var slice_end = end+1
			var cycle = bbox.slice(start,slice_end) // path clockwise to walk around the viewport
			if ((start > end) || (start == end && start > 0)) cycle = cycle.concat(bbox.slice(0,end+1)) //loop around from 3 back to 0
		} else {
			//this is all fucked up:
			if (start <= end) var slice_end = bbox.length
			else var slice_end = start+1
			// if (end > 0) end -= 1
			var cycle = bbox.slice(end,slice_end) // path clockwise to walk around the viewport
			if ((start < end) || (start == end && end > 0)) cycle = cycle.concat(bbox.slice(0,start+1)) //loop around from 3 back to 0
			cycle = cycle.reverse()
		}
		cycle.each(function(coord,index) {
			// nodes.push([coord[0],coord[1]])
			nodes.push(coord)
			// if (clockwise) nodes.push([coord[0],coord[1]])
			// else nodes.unshift([coord[0],coord[1]])

			// $C.line_to(coord[0],coord[1])

			// $C.save()
			// $C.opacity(1)
			// $C.fill_style('black')
			// $C.rect(coord[0]-15,coord[1]-15,30,30)
			// $C.draw_text("Helvetica",40,'white',coord[0]-20,coord[1]-20,index)
			// $C.restore()
		})
		return nodes
	},
	/**
	 * Sorts coastlines a and b from assembled_coastlines by angle of entry
	 */
	sort_coastlines_by_angle: function(a,b) { return (a[1][0] - b[1][0]) }
}