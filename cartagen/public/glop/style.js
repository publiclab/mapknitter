function parse_styles(feature,selector) {
	try {
		if (selector.fillStyle) feature.fillStyle = selector.fillStyle
		if (selector.lineWidth || selector.lineWidth == 0) feature.lineWidth = selector.lineWidth
		if (selector.strokeStyle && Object.isFunction(selector.strokeStyle)) {
			// bind the styles object to the context of this Way:
			feature.strokeStyle = selector.strokeStyle()
		} else {
			feature.strokeStyle = selector.strokeStyle
		}
		// radius is relevant to nodes, i.e. single points
		if (selector.radius) feature.radius = selector.radius
		// check selector for hover:
		if (selector['hover']) feature.hover = selector['hover']
		if (selector['mouseDown']) feature.mouseDown = selector['mouseDown']

		if (styles[feature.name] && styles[feature.name].fillStyle) {
			feature.fillStyle = styles[feature.name].fillStyle
		}
		if (styles[feature.name] && styles[feature.name].strokeStyle) {
			feature.strokeStyle = styles[feature.name].strokeStyle
		}
		// font styling:
		if (selector['fontColor']) feature.fontColor = selector['fontColor']

		feature.tags.each(function(tag) {

			//look for a style like this:
			if (styles[tag.key] && styles[tag.key].fillStyle) {
				feature.fillStyle = styles[tag.key].fillStyle
			}
			if (styles[tag.value] && styles[tag.value].fillStyle) {
				feature.fillStyle = styles[tag.value].fillStyle
			}
			if (styles[tag.key] && styles[tag.key].strokeStyle) {
				feature.strokeStyle = styles[tag.key].strokeStyle
			}
			if (styles[tag.value] && styles[tag.value].strokeStyle) {
				feature.strokeStyle = styles[tag.value].strokeStyle
			}
			if (styles[tag.key] && styles[tag.key].lineWidth) {
				feature.lineWidth = styles[tag.key].lineWidth
			}
			if (styles[tag.value] && styles[tag.value].lineWidth) {
				feature.lineWidth = styles[tag.value].lineWidth
			}
			
			//check tags for hover:
			if (styles[tag.key] && styles[tag.key]['hover']) {
				feature.hover = styles[tag.key]['hover']
			}
			if (styles[tag.value] && styles[tag.value]['hover']) {
				feature.hover = styles[tag.value]['hover']
			}
			//check tags for mouseDown:
			if (styles[tag.key] && styles[tag.key]['mouseDown']) {
				feature.mouseDown = styles[tag.key]['mouseDown']
			}
			if (styles[tag.value] && styles[tag.value]['mouseDown']) {
				feature.mouseDown = styles[tag.value]['mouseDown']
			}
		})
	} catch(e) {
		console.log("There was an error in your stylesheet. Please check http://wiki.cartagen.org for the GSS spec. Error: "+trace(e))
	}
}

function style(feature) {
	canvas.lineJoin = 'round'
	canvas.lineCap = 'round'
	if (feature.strokeStyle) {
		if (Object.isFunction(feature.strokeStyle)) {
			// bind the styles object to the context of this Way:
			strokeStyle(feature.strokeStyle())
		} else {
			strokeStyle(feature.strokeStyle)
		}
	}
	if (feature.fillStyle) {
		if (Object.isFunction(feature.fillStyle)) {
			// bind the styles object to the context of this Way:
			fillStyle(feature.fillStyle())
		} else {
			fillStyle(feature.fillStyle)
		}
	}
	if (feature.lineWidth) {
		if (Object.isFunction(feature.lineWidth)) {
			// bind the styles object to the context of this Way:
			lineWidth(feature.lineWidth())
		} else {
			lineWidth(feature.lineWidth)
		}
	}
	
	// trigger hover and mouseDown styles:
	if (feature instanceof Way) {
		if (feature.hover && feature.closed_poly && is_point_in_poly(feature.nodes,map_pointerX(),map_pointerY())) {
			style(feature.hover)
			if (feature.hover.action) feature.hover.action()
		}
		if (feature.mouseDown && mouseDown == true && feature.closed_poly && is_point_in_poly(feature.nodes,map_pointerX(),map_pointerY())) {
			style(feature.mouseDown)
			if (feature.mouseDown.action) feature.mouseDown.action()
		}
	} else if (feature instanceof Node) {
		if (feature.hover && overlaps(feature.x,feature.y,map_pointerX(),map_pointerY(),100)) {
			style(feature.hover)
			if (feature.hover.action) feature.hover.action()
		}
		if (feature.mouseDown && mouseDown == true && overlaps(feature.x,feature.y,map_pointerX(),map_pointerY(),100)) {
			style(feature.mouseDown)
			if (feature.mouseDown.action) feature.mouseDown.action()
		}
	}
}

// add_style('highway','strokeStyle','red')
function add_style(tag,style,value) {
	eval("styles."+tag+" = {"+style+": '"+value+"'}")
	// styles[tag][style] = value
}

function load_styles(stylesheet_url) {
	if (stylesheet_url[0,4] == "http") {
		stylesheet_url = "/map/style?url="+stylesheet_url
	}
	new Ajax.Request(stylesheet_url,{
		method: 'get',
		onComplete: function(result) {
			styles = ("{"+result.responseText+"}").evalJSON()
			stylesheet_source = "{"+result.responseText+"}"
		}
	})
}

function apply_gss(gss) {
	try {
		styles = ("{"+gss+"}").evalJSON()
		objects.each(function(object) {
			if (object instanceof Node) parse_styles(object,styles.node)
			if (object instanceof Way) parse_styles(object,styles.way)
		},this)
	} catch(e) {
		console.log(trace(e))
	}
}

load_styles(stylesheet)
load_next_script()