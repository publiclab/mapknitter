/**
 * Represents a way. A way is automatically added to the geohash index when
 * it is instantiated.
 * 
 * @augments Feature
 */
var Way = Class.create(Feature, 
/**
 * @lends Node#
 */
{
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

		this.outline_color = null
		this.outline_width = null
		
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
		
		Cartagen.ways.set(this.id,this)
		if (this.coastline) {
			Cartagen.coastlines.push(this)
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
		Cartagen.way_count++
		$super()
		this.age += 1;
	},
	/**
	 * Applies hover and mouseDown styles
	 */
	style: function() {
		// hover
		if (this.hover && this.closed_poly &&
			Geometry.is_point_in_poly(this.nodes, Map.pointer_x(), Map.pointer_y())) {
				if (!this.hover_styles_applied) {
					this.apply_hover_styles()
					this.hover_styles_applied = true
				}
				if (!Object.isUndefined(this.hover.action)) this.hover.action.bind(this)()
		}
		else if (this.hover_styles_applied) {
			this.remove_hover_styles()
			this.hover_styles_applied = false
		}

		// mouseDown
		if (this.mouseDown && Mouse.down == true && this.closed_poly &&
			Geometry.is_point_in_poly(this.nodes,Map.pointer_x(),Map.pointer_y())) {
				if (!this.click_styles_applied) {
					this.apply_click_styles()
					this.click_styles_applied = true
				}
				if (!Object.isUndefined(this.mouseDown.action)) this.mouseDown.action.bind(this)()
		}
		else if (this.click_styles_applied) {
			this.remove_click_styles()
			this.hover_click_applied = false
		}
	},
	/**
	 * Draws on the canvas to display this way
	 */
	shape: function() {
		$C.opacity(1)
		if (this.highlight) {
			$C.line_width(3/Cartagen.zoom_level)
			$C.stroke_style("red")
		}
		// fade in after load:
		if (Object.isUndefined(this.opacity)) this.opacity = 1
		if (this.age < 20) {
			$C.opacity(this.opacity*(this.age/20))
		} else {
			$C.opacity(this.opacity)
		}

		$C.begin_path()
		$C.move_to(this.nodes[0].x,this.nodes[0].y)

		if (Map.resolution == 0) Map.resolution = 1
		this.nodes.each(function(node,index){
			if ((index % Map.resolution == 0) || index == 0 || index == this.nodes.length-1 || this.nodes.length <= 30) {
				Cartagen.node_count++
				$C.line_to(node.x,node.y)
			}
		},this)

		// fill the polygon if the beginning and end nodes are the same.
		// we'll have to change this for open polys, like coastlines
		if (this.outlineColor && this.outlineWidth) $C.outline(this.outlineColor,this.outlineWidth)
		else $C.stroke()
		if (this.closed_poly) $C.fill()

		// show bboxes for ways:
		// $C.line_width(1)
		// $C.stroke_style('red')
		// $C.stroke_rect(this.bbox[1],this.bbox[0],this.bbox[3]-this.bbox[1],this.bbox[2]-this.bbox[0])
	}
})