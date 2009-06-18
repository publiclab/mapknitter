/**
 * @namespace Loads GSS stylesheets and applies styles to features.
 */
var Style = {
	/**
	 * Storage for loaded styles
	 * @type Object (GSS)
	 */
	styles: {
		body: {
			fillStyle: "#eee",
			fontColor: "#eee",
			fontSize: 12,
			fontRotation: 0
		}
	},
	/**
	 * Applies the global "body" styles
	 */
	style_body: function() {
		if (Style.styles.body.fillStyle) $C.fill_style(Style.styles.body.fillStyle)
		if (Style.styles.body.strokeStyle) $C.stroke_style(Style.styles.body.strokeStyle)
		if (Style.styles.body.lineWidth || Style.styles.body.lineWidth == 0) 
			$C.line_width(Style.styles.body.lineWidth)
		if (Style.styles.body.pattern && Object.isUndefined(Style.styles.body.pattern_img)) {
			Style.styles.body.pattern_img = new Image()
			Style.styles.body.pattern_img.src = Style.styles.body.pattern
		}
		if (Style.styles.body.pattern_img) {
			$C.fill_pattern(Style.styles.body.pattern_img,'repeat')
		}
		$C.rect(0, 0, Glop.width, Glop.height)
		$C.stroke_rect(0, 0, Glop.width, Glop.height)
		$C.line_join('round')
		$C.line_cap('round')
	},
	/**
	 * Take styles from GSS and set appropriate properties of a feature
	 * @param {Object} feature  Feature to set properties of
	 * @param {Object} selector A set of default properties to set first, before parsing styles
	 *                          that apply to tags of the feature.
	 */
	parse_styles: function(feature,selector) {
		// copy properties from selector
		if (selector.opacity) feature.opacity = selector.opacity
		if (selector.fillStyle) feature.fillStyle = selector.fillStyle
		if (selector.lineWidth || selector.lineWidth == 0) feature.lineWidth = selector.lineWidth
		if (selector.strokeStyle && Object.isFunction(selector.strokeStyle)) {
			// bind the styles object to the context of this Way:
			feature.strokeStyle = selector.$C.stroke_style()
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
		
		// check selector for hover & mousedown:
		if (selector['hover']) feature.hover = selector['hover']
		if (selector['mouseDown']) feature.mouseDown = selector['mouseDown']

		// copy styles based on feature name
		if (Style.styles[feature.name] && Style.styles[feature.name].fillStyle) 
			feature.fillStyle = Style.styles[feature.name].fillStyle
		if (Style.styles[feature.name] && Style.styles[feature.name].strokeStyle)
			feature.strokeStyle = Style.styles[feature.name].strokeStyle

		// font styling:
		if (selector.fontColor) feature.label.fontColor = selector.fontColor
		if (selector.fontSize) feature.label.fontSize = selector.fontSize
		if (selector.fontScale) feature.label.fontScale = selector.fontScale
		if (selector.fontRotation) feature.label.fontRotation = selector.fontRotation
		if (selector.fontBackground) feature.label.fontBackground = selector.fontBackground
		if (selector.text) feature.label.text = selector.text

		feature.tags.each(function(tag) {
			//look for a style like this:
			if (Style.styles[tag.key]) {
				if (Style.styles[tag.key].opacity) 
					feature.opacity = Style.styles[tag.key].opacity
				if (Style.styles[tag.key].fillStyle) 
					feature.fillStyle = Style.styles[tag.key].fillStyle
				if (Style.styles[tag.key].strokeStyle) 
					feature.strokeStyle = Style.styles[tag.key].strokeStyle
				if (Style.styles[tag.key].lineWidth) 
					feature.lineWidth = Style.styles[tag.key].lineWidth
				if (Style.styles[tag.key].fontColor) 
					feature.label.fontColor = Style.styles[tag.key].fontColor
				if (Style.styles[tag.key].fontSize) 
					feature.label.fontSize = Style.styles[tag.key].fontSize
				if (Style.styles[tag.key].fontScale) 
					feature.label.fontScale = Style.styles[tag.key].fontScale
				if (Style.styles[tag.key].fontRotation) 
					feature.label.fontRotation = Style.styles[tag.key].fontRotation
				if (Style.styles[tag.key].fontBackground) 
					feature.label.fontBackground = Style.styles[tag.key].fontBackground
				if (Style.styles[tag.key].text) {
					if (Object.isFunction(Style.styles[tag.key].text)) 
						feature.label.text = Style.styles[tag.key].text.apply(feature)
					else feature.label.text = Style.styles[tag.key].text
				}
				if (Style.styles[tag.key].pattern) {
					feature.pattern_img = new Image()
					feature.pattern_img.src = Style.styles[tag.key].pattern
				}
			}
			if (Style.styles[tag.value]) {
				if (Style.styles[tag.value].opacity) 
					feature.opacity = Style.styles[tag.value].opacity
				if (Style.styles[tag.value].fillStyle) 
					feature.fillStyle = Style.styles[tag.value].fillStyle
				if (Style.styles[tag.value].strokeStyle) 
					feature.strokeStyle = Style.styles[tag.value].strokeStyle
				if (Style.styles[tag.value].lineWidth) 
					feature.label.lineWidth = Style.styles[tag.value].lineWidth
				if (Style.styles[tag.value].fontColor) 
					feature.label.fontColor = Style.styles[tag.value].fontColor
				if (Style.styles[tag.value].fontSize) 
					feature.label.fontSize = Style.styles[tag.value].fontSize
				if (Style.styles[tag.value].fontScale) 
					feature.label.fontScale = Style.styles[tag.value].fontScale
				if (Style.styles[tag.value].fontRotation) 
					feature.label.fontRotation = Style.styles[tag.value].fontRotation
				if (Style.styles[tag.value].fontBackground) 
					feature.label.fontBackground = Style.styles[tag.value].fontBackground
				if (Style.styles[tag.value].text) {
					if (Object.isFunction(Style.styles[tag.value].text)) 
						feature.label.text = Style.styles[tag.value].text.apply(feature)
					else feature.label.text = Style.styles[tag.value].text
				}
				if (Style.styles[tag.value].pattern) {
					feature.pattern_img = new Image()
					feature.pattern_img.src = Style.styles[tag.value].pattern
				}
			}

			//check tags for hover:
			if (Style.styles[tag.key] && Style.styles[tag.key]['hover']) {
				feature.hover = Style.styles[tag.key]['hover']
			}
			if (Style.styles[tag.value] && Style.styles[tag.value]['hover']) {
				feature.hover = Style.styles[tag.value]['hover']
			}
			//check tags for mouseDown:
			if (Style.styles[tag.key] && Style.styles[tag.key]['mouseDown']) {
				feature.mouseDown = Style.styles[tag.key]['mouseDown']
			}
			if (Style.styles[tag.value] && Style.styles[tag.value]['mouseDown']) {
				feature.mouseDown = Style.styles[tag.value]['mouseDown']
			}
			// check tags for refresh:
			if (Style.styles[tag.key] && Style.styles[tag.key]['refresh']) {

				$H(Style.styles[tag.key]['refresh']).each(function(pair) {
					Style.create_refresher(feature, pair.key, pair.value)
				})
			}
			if (Style.styles[tag.value] && Style.styles[tag.value]['refresh']) {
				if(!feature.style_generators) feature.style_generators = {}
				$H(Style.styles[tag.value]['refresh']).each(function(pair) {
					Style.create_refresher(feature, pair.key, pair.value)
				})
			}
		})
	},
	/**
	 * Creates a periodical executer that updates a property
	 * @param {Feature} feature  Feature to update
	 * @param {String}  property Property to update
	 * @param {NUmber}  interval Number of seconds between updates
	 */
	create_refresher: function(feature, property, interval) {
		if (Object.isFunction(feature[property])) { //sanity check
            if (['fontBackground', 'fontColor', 'fontScale', 
			     'fontSize', 'fontRotation', 'text'].include(property)) {
                	feature = feature.label
            }
			if(!feature.style_generators) feature.style_generators = {}
			if(!feature.style_generators.executers) feature.style_generators.executers = {}
			feature.style_generators[property] = feature[property]
			Style.refresh_style(feature, property)
			feature.style_generators.executers[property] = new PeriodicalExecuter(function() {
				Style.refresh_style(feature, property)
			}, interval)
		}
	},
	/**
	 * Refreshes a property from its generator
	 * @param {Feature} feature  Feature to update
	 * @param {String}  property Property to update
	 */
	refresh_style: function(feature, property) {
		feature[property] = feature.style_generators[property]()
	},
	/**
	 * Prepares the canvas to draw a feature
	 * @param {Feature} feature Feature that will be drawn
	 */
	apply_style: function(feature) {
		$C.opacity(1)
		if (feature.opacity) {
			$C.opacity(Object.value(feature.opacity))
		}
		if (feature.strokeStyle) {
			 $C.stroke_style(Object.value(feature.strokeStyle))
		}
		if (feature.fillStyle) {
			$C.fill_style(Object.value(feature.fillStyle))
		}
		if (feature.pattern_img) {
			$C.fill_pattern(feature.pattern_img,'repeat')
		}
		if (feature.lineWidth) {
			$C.line_width(Object.value(feature.lineWidth))
		}
		
		// trigger hover and mouseDown styles:
		if (feature instanceof Way) {
			if (feature.hover && feature.closed_poly && 
			    Geometry.is_point_in_poly(feature.nodes,Map.pointer_x(),Map.pointer_y())) {
					Style.apply_style(feature.hover)
					if (!Object.isUndefined(feature.hover.action)) feature.hover.action()
			}
			if (feature.mouseDown && Mouse.down == true && feature.closed_poly && 
			    Geometry.is_point_in_poly(feature.nodes,Map.pointer_x(),Map.pointer_y())) {
					Style.apply_style(feature.mouseDown)
					if (!Object.isUndefined(feature.mouseDown.action)) feature.mouseDown.action()
			}
		} else if (feature instanceof Node) {
			if (feature.hover && 
			    Geometry.overlaps(feature.x,feature.y,Map.pointer_x(),Map.pointer_y(),100)) {
					Style.apply_style(feature.hover)
					if (feature.hover.action) feature.hover.action()
			}
			if (feature.mouseDown && Mouse.down == true && 
			    Geometry.overlaps(feature.x,feature.y,Map.pointer_x(),Map.pointer_y(),100)) {
					Style.apply_style(feature.mouseDown)
					if (feature.mouseDown.action) feature.mouseDown.action()
			}
		}
	},
	/**
	 * Same as {@see Style.apply_style} but just for fonts. This was necessary because
	 * strokeStyle and such have to be reset *after* drawing actual polygons but
	 * *before* drawing text.
	 * @param {Feature} feature The feature whose label will be drawn
	 */
	apply_font_style: function(feature) {
		if (feature.fontColor) {
			if (Object.isFunction(feature.fontColor)) $C.stroke_style(feature.fontColor())
			else $C.stroke_style(feature.fontColor)
		}
	},
	/**
	 * Loads a remove stylesheet.
	 * @param {String} stylesheet_url URL of stylesheet
	 */
	load_styles: function(stylesheet_url) {
		if (stylesheet_url[0,4] == "http") {
			stylesheet_url = "/map/style?url="+stylesheet_url
		}
		new Ajax.Request(stylesheet_url,{
			method: 'get',
			onComplete: function(result) {
				$l('applying '+stylesheet_url)
				Style.styles = ("{"+result.responseText+"}").evalJSON()
				//Style.stylesheet_source = "{"+result.responseText+"}"
				//Style.apply_gss(Style.stylesheet_source)
				// populate the gss field
				if($('gss_textarea')) {
					$('gss_textarea').value = result.responseText
				}
			}
		})
	},
	/**
	 * Given a string of gss, applies the string to all Ways and Nodes in the objects array
	 * @param {String} gss String of GSS
	 * @param {Boolean} clear If true, styles are reset before they are applied.
	 */ 
	apply_gss: function(gss) {
		if (Object.isUndefined(arguments[1])) var clear_styles = true
		else clear_styles = arguments[1]
		Style.styles = gss.evalJSON()
		objects.each(function(object) {
			if (clear_styles) {
				object.lineWeight = null
				object.strokeStyle = null
				object.fillStyle = null
				object.hover = null
				object.mouseDown = null
			}
			if (object instanceof Node) Style.parse_styles(object,Style.styles.node)
			if (object instanceof Way) Style.parse_styles(object,Style.styles.way)
		},this)
	}
}