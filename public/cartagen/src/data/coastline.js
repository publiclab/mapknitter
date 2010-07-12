var Coastline = {
	/**
	 * 
	 */
	initialize: function() {
		// Cartagen.observe('predraw',		'draw',this)
		// Cartagen.observe('postdraw',		'cleanup',this)
		// Cartagen.observe('initialize',	'setup',this)

		// Cartagen.observe({
		// 	predraw: 'a',
		// 	draw: 'b',
		// 	postdraw: 'c'
		// }, this)
		
		Glop.observe('cartagen:predraw', Coastline.draw.bindAsEventListener(this))
	},
	/**
	 * Array of coastline ways to be assembled occasionally into coastline 'collected way' relations
	 */
	coastlines: [],
	/**
	 * Array of nodes of coastlines within the viewport, combining multiple 
	 * coastlines and the viewport corners where applicable; used to 
	 * 'walk' around the viewport. Solves peninsula/estuary problem where 
	 * multiple unconnected coastlines enter the viewport and must be reconciled
	 */
	coastline_nodes: [],
	/**
	 * 
	 */
	assembled_coastline: [],
	/**
	 * 
	 */
	draw: function() {
		if (Config.vectors) {
		Coastline.assembled_coastline = []
		Feature.relations.values().each(function(object) {
			// invent a better way to trigger collect_nodes, based on Viewport change:
			// if (Glop.frame == 0 || Glop.frame % 30 == 0) object.collect_nodes()
			$l(object.id+' relation')
			object.collect_nodes()
			if (object.coastline_nodes.length > 0) Coastline.assembled_coastline.push([object.coastline_nodes,[object.entry_angle,object.exit_angle]])
		})
	
		// if we have any coastline relations to run through and draw:
		if (Coastline.assembled_coastline.length > 0) {
			Coastline.assembled_coastline.sort(Coastline.sort_coastlines_by_angle)

			$C.begin_path()
		
			var start_corner,end_corner,start_angle,end_angle
			Coastline.assembled_coastline.each(function(coastline,index) {
				coastline.push(Viewport.nearest_corner(coastline[0].first()[0],coastline[0].first()[1]))
				coastline.push(Viewport.nearest_corner(coastline[0].last()[0],coastline[0].last()[1]))
			})
		
			var corners = []
		
			Coastline.assembled_coastline.each(function(coastline,index) { 
				//coastline[2] = child start_corner ([x,y])
				//coastline[3] = child end_corner ([x,y])
				corners.push(coastline[2][2])
				$C.move_to(coastline[2][0],coastline[2][1])
			
				// $l(coastline[0].length+':'+coastline[2][2]+'=start '+coastline[0].first()[0]+','+coastline[0].first()[1]+'=first')
			
				// $C.save()
				// $C.opacity(0.4)
				// $C.fill_style('green')
				// $C.rect(coastline[2][0]-50,coastline[2][1]-50,100,100)
				// $C.restore()
			
				coastline[0].each(function(node,c_index) { 
					$C.line_to(node[0],node[1])
					// $C.save()
					// $C.fill_style('green')
					// $C.rect(node[0]-5,node[1]-5,10,10)
					// $C.draw_text("Helvetica",20,'white',node[0]-10,node[1]-10,parseInt((coastline[1][0]*180)/Math.PI)+','+index+':'+c_index)
					// $C.save()
				}) 
				$C.line_to(coastline[3][0],coastline[3][1])
			
				// if there are remaining coastlines, clockwise of this one:
				if (Coastline.assembled_coastline[index+1]) {
					// walk back to the start point before going on to the next:
					if (index != Coastline.assembled_coastline.length-1) {
						corners.push(coastline[3][2],coastline[2][2])
						$l('walking to beginning!: '+coastline[3][2]+"/"+coastline[2][2]+':'+Coastline.walk(coastline[3][2],coastline[2][2],false).inspect())
						Coastline.walk(coastline[3][2],coastline[2][2],false).each(function(n) {
							$C.line_to(n[0],n[1])
						})
					}
					// walk on to the next coastline:
					if (coastline[2][2] != Coastline.assembled_coastline[index+1][2][2]) {
						corners.push(coastline[2][2],Coastline.assembled_coastline[index+1][2][2])
						$l('walking to next!: '+coastline[2][2]+"/"+Coastline.assembled_coastline[index+1][2][2]+':'+Coastline.walk(coastline[2][2],Coastline.assembled_coastline[index+1][2][2]).inspect())
						Coastline.walk(coastline[2][2],Coastline.assembled_coastline[index+1][2][2]).each(function(n) {
							$C.line_to(n[0],n[1])
						})
					}
				}

				if (index == 0) {
					start_corner = coastline[2]
					start_angle = coastline[1][0]
				}
				if (index == Coastline.assembled_coastline.length-1) {
					end_corner = coastline[3]
					end_angle = coastline[1][1]
				}
			},this)

			// $C.save()
			// $C.opacity(0.4)
			// $C.fill_style('yellow')
			// $C.rect(end_corner[0]-35,end_corner[1]-35,70,70)
			// $C.restore()
			// 
			// $C.save()
			// $C.opacity(1)
			// $C.fill_style('purple')
			// $C.rect(start_corner[0]-20,start_corner[1]-20,40,40)
			// $C.restore()
		
		
			// if 
			// walk back to the start point ONLY if the start angle is less than the end angle.
			// it's not enough to know they're both at corner 1; did it turn clockwise or not?
			// $l('angles: end:'+end_corner[2]+'/'+parseInt((end_angle*180)/Math.PI) +', start:'+start_corner[2]+'/'+ parseInt((start_angle*180)/Math.PI))
				// $C.save()
				// $C.opacity(1)
				// $C.fill_style('red')
				// $C.translate(Map.x,Map.y)
				// $C.rotate(end_angle)
				// $C.rect(0,-100,4,100)
				// $C.rotate(-end_angle)
				// $C.fill_style('green')
				// $C.rotate(start_angle)
				// $C.rect(0,-100,4,100)
				// $C.rotate(-start_angle)
				// $C.translate(-Map.x,-Map.y)
				// $C.restore()
			if ((end_corner[2] == start_corner[2]) && (end_angle < start_angle)) {
				// $l('no-walk!!')
			} else if (end_corner[2] != start_corner[2] || end_angle > start_angle) {
				corners.push(end_corner[2],start_corner[2])
				$l('walking around!: '+end_corner[2]+"/"+start_corner[2]+':'+Coastline.walk(end_corner[2],start_corner[2]).inspect())
				Coastline.walk(end_corner[2],start_corner[2]).each(function(n) {
					$C.line_to(n[0],n[1])
				})
			}
			$l('ending: '+corners)
		
			var coastline_style = Style.styles.relation
			if (coastline_style.lineWidth) $C.line_width(coastline_style.lineWidth)
			if (coastline_style.strokeStyle) $C.stroke_style(coastline_style.strokeStyle)
			if (coastline_style.opacity) $C.opacity(coastline_style.opacity)
			$C.stroke()
			if (coastline_style.pattern) {
				if (!coastline_style.pattern.src) {
					var value = coastline_style.pattern
					coastline_style.pattern = new Image()
					coastline_style.pattern.src = value
				}
				$C.fill_pattern(coastline_style.pattern, 'repeat')	
			} else $C.fill_style(coastline_style.fillStyle)
			$C.fill()
		}
		}
	},
	refresh_coastlines: function() {
		// flush coastline collected_ways relations and re-generate them with new coastlines:
		Coastline.coastlines.each(function(c){c.neighbors = []})
		Coastline.coastlines.each(function(coastline_a) {
			Coastline.coastlines.each(function(coastline_b) {
				if (coastline_a.id != coastline_b.id) {
					if (coastline_a.nodes.last().id == coastline_b.nodes.first().id) {
						coastline_a.neighbors[1] = coastline_b
						coastline_b.neighbors[0] = coastline_a
					}
				}
			})
		})
		
		var coastline_chains = Coastline.coastlines.clone()
		Feature.relations = new Hash()
		while (coastline_chains.length > 0) {
			var data = {
				members: coastline_chains.first().chain([],true,true)
			}
			// remove chain members from coastline chain:
			data.members.each(function(member) {
				coastline_chains.each(function(coastline,index) {
					if (coastline.id == member.id) coastline_chains.splice(index,1)
				})
			})
			new Relation(data)
		}
		$l('refreshed coastlines')
		Feature.relations.each(function(r) {
			$l(r.inspect())
		})
	},
	/**
	 * Returns an array of points (corners) along the edge of the Viewport from the start param to the end param.
	 * Params are integers where corner is 0,1,2,3 clockwise from top left. Returns as [[x,y],[x,y]...]
	 * @param {Array} start The corner to begin the walk.
	 * @param {Array} end The corner to walk to.
	 */
	walk: function(start,end,clockwise) {
		if (Object.isUndefined(clockwise)) clockwise = true
		$l(start+'/'+end+',clockwise '+clockwise+': '+this.walk_n(start,end,clockwise))
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

document.observe('cartagen:init', Coastline.initialize.bindAsEventListener(Coastline))
