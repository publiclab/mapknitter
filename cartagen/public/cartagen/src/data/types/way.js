/**
 * Represents a way. A way is automatically added to the geohash index when
 * it is instantiated.
 * 
 * @augments Feature
 */
var Way = Class.create(Feature, 
/**
 * @lends Way#
 */
{
	__type__: 'Way',
	/**
	 * Sets up this way's properties and adds it to the geohash index
	 * @param {Object} data         A set of properties that will be copied to this Way.
	 * @constructs
	 */
    initialize: function($super, data) {
		$super()
		geohash = geohash || true
		/**
		 * Number of frames this Way has existed for
		 * @type Number
		 */
		this.age = 0
		/**
		 * Timestamp of way creation
		 * @type Date
		 */
		this.birthdate = new Date
		/**
		 * If true, this way will have a red border
		 * @type Boolean
		 */
		this.highlight = false
		/**
		 * Nodes that make up this Way
		 * @type Node[]
		 */
		this.nodes = []
		/**
		 * If true, this way will be treated a a polygon and filled when drawn
		 * @type Boolean
		 */
		this.closed_poly = false
		
		this.is_hovered = false
		
		Object.extend(this, data)
		
		if (this.nodes.length > 1 && this.nodes.first().x == this.nodes.last().x && 
			this.nodes.first().y == this.nodes.last().y) 
				this.closed_poly = true
				
		if (this.tags.get('natural') == "coastline") this.closed_poly = true
		
		if (this.closed_poly) {
			var centroid = Geometry.poly_centroid(this.nodes)
			this.x = centroid[0]*2
			this.y = centroid[1]*2
		} else {
			// attempt to make letters follow line segments:
			this.x = (this.middle_segment()[0].x+this.middle_segment()[1].x)/2
			this.y = (this.middle_segment()[0].y+this.middle_segment()[1].y)/2
		}
		
		this.area = Geometry.poly_area(this.nodes)
		this.bbox = Geometry.calculate_bounding_box(this.nodes)
		
		// calculate longest dimension to file in a correct geohash:
		// Can we do this in lon/lat only, i.e. save some calculation?
		this.width = Math.abs(Projection.x_to_lon(this.bbox[1])-Projection.x_to_lon(this.bbox[3]))
		this.height = Math.abs(Projection.y_to_lat(this.bbox[0])-Projection.y_to_lat(this.bbox[2]))
		
		Feature.ways.set(this.id,this)
		if (this.coastline) {
			Coastline.coastlines.push(this)
		} else {
			Style.parse_styles(this,Style.styles.way)
			Geohash.put_object(this)
		}
    },
	/**
	 * for coastlines, the [prev,next] way in the series
	 */
	neighbors: [false,false],
	/**
	 * Adds a reference to itself into the 'chain' array and calls coastline_chain on the next or prev member
	 * @param {Array}    chain  The array representing the chain of connected Ways
	 * @param {Boolean}  prev   If the call is going to the prev member
	 * @param {Boolean}  next   If the call is going to the next member
	 */	
	chain: function(chain,prev,next) {
		// check if this way has appeared in the chain already:
		var uniq = true
		chain.each(function(way) {
			if (way.id == this.id) uniq = false
		},this)
		if (uniq) {
			if (prev) chain.push(this)
			else chain.unshift(this)
			$l(chain.length + ","+prev+next)
			if (prev && this.neighbors[0]) { // this is the initial call
				this.neighbors[0].chain(chain,true,false)
			}
			if (next && this.neighbors[1]) {
				this.neighbors[1].chain(chain,false,true)
			}
		}
		return chain
	},
	/** 
	 * Finds the middle-most line segment
	 * @return a tuple of nodes
	 * @type Node[]
	 */	
	 middle_segment: function() {
        if (this.nodes.length == 1) {
            return [this.nodes[0], this.nodes[0]]
        }
        else if (this.nodes.length == 2) {
            return [this.nodes[0], this.nodes[1]]
        }
        else {
            return [this.nodes[Math.floor(this.nodes.length/2)],
			        this.nodes[Math.floor(this.nodes.length/2)+1]]
        }
	},
	/**
	 * Finds the angle of the middle-most line segment
	 * @return The angle, in radians
	 * @type Number
	 */
	middle_segment_angle: function() {
        var segment = this.middle_segment()
        if (segment[1]) {
            var _x = segment[0].x-segment[1].x
            var _y = segment[0].y-segment[1].y
            return (Math.tan(_y/_x))
        } else return 0
	},
	/**
	 * Draws this way on the canvas
	 */
	draw: function($super) {
		$super()
		this.age += 1;
	},
	/**
	 * Applies hover and mouseDown styles
	 */
	style: function() {
		if (this.hover || this.menu) {
			this.is_hovered = this.is_inside(Map.pointer_x(), Map.pointer_y())
		}
		// hover
		if (this.hover && this.is_hovered) {
				if (!this.hover_styles_applied) {
					Mouse.hovered_features.push(this)
					this.apply_hover_styles()
					this.hover_styles_applied = true
				}
				if (!Object.isUndefined(this.hover.action)) this.hover.action.bind(this)()
		}
		else if (this.hover_styles_applied) {
			Mouse.hovered_features = Mouse.hovered_features.without(this)
			this.remove_hover_styles()
			this.hover_styles_applied = false
		}

		// mouseDown
		if (this.mouseDown && Mouse.down == true && this.is_hovered) {
				if (!this.click_styles_applied) {
					this.apply_click_styles()
					this.click_styles_applied = true
				}
				if (!Object.isUndefined(this.mouseDown.action)) this.mouseDown.action.bind(this)()
		}
		else if (this.click_styles_applied) {
			this.remove_click_styles()
			this.click_styles_applied = false
		}
		
		if (this.menu) {
			if (this.is_hovered) {
				this.menu.each(function(id) {
					ContextMenu.cond_items[id].avail = true
					ContextMenu.cond_items[id].context = this
				}, this)
			}
			else {
				this.menu.each(function(id) {
					if (ContextMenu.cond_items[id].context == this) {
						ContextMenu.cond_items[id].avail = false
						ContextMenu.cond_items[id].context = window
					}
				}, this)
			}
		}
	},
	/**
	 * Draws on the canvas to display this way
	 */
	shape: function() {
		$C.opacity(1)
		if (this.highlight) {
			$C.line_width(3/Map.zoom)
			$C.stroke_style("red")
		}
		// fade in after load:
		if (Object.isUndefined(this.opacity)) this.opacity = 1
		if ((Glop.date - this.birthdate) < 4000) {
			$C.opacity(Math.max(0,0.1+this.opacity*((Glop.date - this.birthdate)/4000)))
		} else {
			$C.opacity(this.opacity)
		}

		$C.begin_path()
		if (Config.distort) $C.move_to(this.nodes[0].x,this.nodes[0].y+Math.max(0,75-Geometry.distance(this.nodes[0].x,this.nodes[0].y,Map.pointer_x(),Map.pointer_y())/4))
		else $C.move_to(this.nodes[0].x,this.nodes[0].y)

		if (Map.resolution == 0) Map.resolution = 1
		this.nodes.each(function(node,index){
			if ((index % Map.resolution == 0) || index == this.nodes.length-1 || this.nodes.length <= 30) {
				// if (this.distort) $C.line_to(node.x,node.y+this.distort/Geometry.distance(node.x,node.y,Map.pointer_x(),Map.pointer_y()))
				if (Config.distort) $C.line_to(node.x,node.y+Math.max(0,75-Geometry.distance(node.x,node.y,Map.pointer_x(),Map.pointer_y())/4))
				else $C.line_to(node.x,node.y)
			}
		},this)

		// fill the polygon if the beginning and end nodes are the same.
		// we'll have to change this for open polys, like coastlines
		if (this.outlineColor && this.outlineWidth) $C.outline(this.outlineColor,this.outlineWidth)
		else $C.stroke()
		if (this.closed_poly) $C.fill()

		if (this.image) {
			if (!this.image.src) {
				var src = this.image
				this.image = new Image()
				this.image.src = src
			} else if (this.image.width > 0) {
				$C.draw_image(this.image, this.x-this.image.width/2, this.y-this.image.height/2)	
			}
		}
		// show bboxes for ways:
		// $C.line_width(1)
		// $C.stroke_style('red')
		// $C.stroke_rect(this.bbox[1],this.bbox[0],this.bbox[3]-this.bbox[1],this.bbox[2]-this.bbox[0])
	},
	apply_default_styles: function($super) {
		$super()
		this.outline_color = null
		this.outline_width = 0
	},
	refresh_styles: function() {
		this.apply_default_styles()
		Style.parse_styles(this, Style.styles.way)
	},
	is_inside: function(x, y) {
		if (this.closed_poly) {
			return Geometry.is_point_in_poly(this.nodes, x, y)
		}
		else {
			width = this.lineWidth + this.outline_width
			
			return Geometry.point_line_distance(x, y, this.nodes) < width
		}
	}
})
