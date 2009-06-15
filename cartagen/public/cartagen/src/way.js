
var Way = Class.create({
	age: 0,
	highlight: false,
	nodes: [],
	label: null,
	closed_poly: false,
	tags: new Hash(),
	fillStyle: "#555",
	fontColor: "#eee",
	fontSize: 12,
	fontRotation: 0,
    initialize: function(data) {
		Object.extend(this, data)
		if (this.nodes.length > 1 && this.nodes[0].x == this.nodes[this.nodes.length-1].x && this.nodes[0].y == this.nodes[this.nodes.length-1].y) this.closed_poly = true
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
		this.area = poly_area(this.nodes)
		this.label = new Label(this)
		this.bbox = Geometry.calculate_bounding_box(this.nodes)
			// calculate longest dimension to file in a correct geohash:
			this.width = Math.abs(Projection.x_to_lon(this.bbox[1])-Projection.x_to_lon(this.bbox[3]))
			this.height = Math.abs(Projection.y_to_lat(this.bbox[0])-Projection.y_to_lat(this.bbox[2]))
		Style.parse_styles(this,Style.styles.way)
		objects.push(this) // made obsolete by Geohash
		Geohash.put_object(this)
		Cartagen.ways.set(this.id,this)
    },
	// returns the middle-most line segment as a tuple [node_1,node_2]
	middle_segment: function() {
		// Cartagen.debug(this.nodes[Math.floor(this.nodes.length/2)+1])
        if (this.nodes.length == 1) {
            return [this.nodes[0], this.nodes[0]]
        }
        else if (this.nodes.length == 2) {
            return [this.nodes[0], this.nodes[1]]
        }
        else {
            return [this.nodes[Math.floor(this.nodes.length/2)],this.nodes[Math.floor(this.nodes.length/2)+1]]
        }
	},
	middle_segment_angle: function() {
        var segment = this.middle_segment()
        if (segment[1]) {
            var _x = segment[0].x-segment[1].x
            var _y = segment[0].y-segment[1].y
            return (Math.tan(_y/_x)/1.7)
        } else return 90
	},
	draw: function() {
		Cartagen.object_count++
		// only draw if in the viewport:
		if (intersect(Viewport.bbox[0],Viewport.bbox[1],Viewport.bbox[2],Viewport.bbox[3],this.bbox[0],this.bbox[1],this.bbox[2],this.bbox[3])) {
			Cartagen.way_count++
			this.shape()
			this.age += 1;
		}
	},
	shape: function() {
		canvas.save()
			Style.apply_style(this)
			if (this.highlight) {
				$C.line_width(3/Cartagen.zoom_level)
				$C.stroke_style("red")
			}
			// fade in after load:
			if (Object.isUndefined(this.opacity)) this.opacity = 1
			if (this.age < 20) {
				canvas.globalAlpha = this.opacity*(this.age/20)
			} else {
				canvas.globalAlpha = this.opacity
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
		$C.stroke()
		if (this.closed_poly) $C.fill()

		// show bboxes for ways:
		// $C.line_width(1)
		// $C.stroke_style('red')
		// $C.stroke_rect(this.bbox[1],this.bbox[0],this.bbox[3]-this.bbox[1],this.bbox[2]-this.bbox[0])

		// draw label if we're zoomed in enough'
		if (Cartagen.zoom_level > 0.3) {
			Cartagen.queue_label(this.label, this.x, this.y)
		}
	    canvas.restore()
	}
})