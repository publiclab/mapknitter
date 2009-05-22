var Style = {
	parse_styles: function(feature,selector) {
		try {
			if (selector.fillStyle) feature.fillStyle = selector.fillStyle
			if (selector.lineWidth || selector.lineWidth == 0) feature.lineWidth = selector.lineWidth
			if (selector.strokeStyle && Object.isFunction(selector.strokeStyle)) {
				// bind the styles object to the context of this Way:
				feature.strokeStyle = selector.strokeStyle()
			} else {
				feature.strokeStyle = selector.strokeStyle
			}
			// patterns
			if (selector.pattern) {
				feature.pattern_img = new Image()
				feature.pattern_img.src = selector.pattern
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
				if (styles[tag.key] && styles[tag.key].pattern) {
					feature.pattern_img = new Image()
					feature.pattern_img.src = styles[tag.key].pattern
				}
				if (styles[tag.value] && styles[tag.value].pattern) {
					feature.pattern_img = new Image()
					feature.pattern_img.src = styles[tag.value].pattern
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
	},
	apply_style: function(feature) {
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
		if (feature.pattern_img) {
			fillStyle(canvas.createPattern(feature.pattern_img,'repeat'))
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
			if (feature.hover && feature.closed_poly && is_point_in_poly(feature.nodes,Map.pointer_x(),Map.pointer_y())) {
				Style.apply_style(feature.hover)
				if (!Object.isUndefined(feature.hover.action)) feature.hover.action()
			}
			if (feature.mouseDown && mouseDown == true && feature.closed_poly && is_point_in_poly(feature.nodes,Map.pointer_x(),Map.pointer_y())) {
				Style.apply_style(feature.mouseDown)
				if (!Object.isUndefined(feature.mouseDown.action)) feature.mouseDown.action()
			}
		} else if (feature instanceof Node) {
			if (feature.hover && overlaps(feature.x,feature.y,Map.pointer_x(),Map.pointer_y(),100)) {
				Style.apply_style(feature.hover)
				if (feature.hover.action) feature.hover.action()
			}
			if (feature.mouseDown && mouseDown == true && overlaps(feature.x,feature.y,Map.pointer_x(),Map.pointer_y(),100)) {
				Style.apply_style(feature.mouseDown)
				if (feature.mouseDown.action) feature.mouseDown.action()
			}
		}
	},
	// add an individual style to the styles object. May not actually work; old code.
	// add_style('highway','strokeStyle','red')
	add_style: function(tag,style,value) {
		eval("styles."+tag+" = {"+style+": '"+value+"'}")
	},
	// load a remote stylesheet, given a URL
	load_styles: function(stylesheet_url) {
		console.log('loading!!'+stylesheet_url)
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
	},
	// given a string of gss, applies the string to all Ways and Nodes in the objects array
	apply_gss: function(gss) {
		if (Object.isUndefined(arguments[1])) var clear_styles = true
		else clear_styles = arguments[1]
		styles = gss.evalJSON()
		objects.each(function(object) {
			if (clear_styles) {
				object.lineWeight = null
				object.strokeStyle = null
				object.fillStyle = null
				object.hover = null
				object.mouseDown = null
			}
			if (object instanceof Node) Style.parse_styles(object,styles.node)
			if (object instanceof Way) Style.parse_styles(object,styles.way)
		},this)
	}
}

Style.load_styles(stylesheet)
load_next_script()