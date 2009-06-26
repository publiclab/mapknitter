/**
 * @namespace Loads GSS stylesheets and applies styles to features.
 */
var Style = {
	properties: new Hash(),
	label_styles: [],
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
	register_properties: function(props) {
		$H(props).each(function(pair) {
			var name = pair.key
			var handlers = pair.value
			
			handlers = handlers || {}
			handlers.parse = handlers.parse || function(feature, value) {
				feature[name] = value
			}
			handlers.apply = handlers.apply || Prototype.emptyFunction
			
			if (handlers.label_style) {
				this.label_styles.push(name)
			}
			
			this.properties.set(name, handlers)
		}.bind(this))
	},
	/**
	 * Applies the global "body" styles
	 */
	style_body: function() {
		this.properties.each(function(property) {
			if (Style.styles.body[property.key] || Style.styles.body[property.key] == 0)
				property.value.apply(Style.styles.body)
		})
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
		this.properties.each(function(property) {
			var f = feature
			if (property.value.label_style) {
				f = feature.label
			}
			
			var h = property.value.parse.bind(f)
			
			if (selector[property.key])
				h(feature, selector[property.key])
				
			if (Style.styles[feature.name] && Style.styles[feature.name][property.key])
				h(feature, Style.styles[feature.name][property.key])
				
			feature.tags.each(function(tag) {
				if (Style.styles[tag.key] && Style.styles[tag.key][property.key])
					h(feature, Style.styles[tag.key][property.key])
					
				if (Style.styles[tag.value] && Style.styles[tag.value][property.key])
					h(feature, Style.styles[tag.value][property.key])
			})
			
		})
		// copy properties from selector
		if (selector.outlineColor) feature.outlineColor = selector.outlineColor
		if (selector.outlineWidth) feature.outlineColor = selector.outlineWidth
		// radius is relevant to nodes, i.e. single points
		if (selector.radius) feature.radius = selector.radius
		
		// check selector for hover & mousedown:
		if (selector['hover']) feature.hover = selector['hover']
		if (selector['mouseDown']) feature.mouseDown = selector['mouseDown']

		// copy styles based on feature name
		if (Style.styles[feature.name] && Style.styles[feature.name].strokeStyle)
			feature.strokeStyle = Style.styles[feature.name].strokeStyle

		// font styling:
		if (selector.fontColor) feature.label.fontColor = selector.fontColor
		if (selector.fontSize) feature.label.fontSize = selector.fontSize
		if (selector.fontScale) feature.label.fontScale = selector.fontScale
		if (selector.fontRotation) feature.label.fontRotation = selector.fontRotation
		if (selector.fontBackground) feature.label.fontBackground = selector.fontBackground
		if (selector.text) feature.label.text = selector.text

		if (feature.tags) {
			feature.tags.each(function(tag) {
				//look for a style like this:
				if (Style.styles[tag.key]) {
					if (Style.styles[tag.key].outlineColor)
						feature.outlineColor = Style.styles[tag.key].outlineColor
					if (Style.styles[tag.key].outlineWidth)
						feature.outlineWidth = Style.styles[tag.key].outlineWidth
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
				}
				if (Style.styles[tag.value]) {
					if (Style.styles[tag.value].outlineColor)
						feature.outlineColor = Style.styles[tag.value].outlineColor
					if (Style.styles[tag.value].outlineWidth)
						feature.outlineWidth = Style.styles[tag.value].outlineWidth
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
		}
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
		this.properties.each(function(property) {
			if (feature[property.key]) {
				property.value.apply(feature)
			}
		})
		
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
	 * Same as apply_style but just for fonts. This was necessary because
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
				if (this.styles['body']) 
					this.parse_styles(this.styles.body, this.styles.body)
				if (this.styles['node'])
					this.parse_styles(this.styles.node, this.styles.node)
				if (this.styles['way'])
					this.parse_styles(this.styles.way, this.styles.way)

				if($('gss_textarea')) {
					$('gss_textarea').value = result.responseText
				}
			}
		})
	}
}

Style.register_properties({
	fillStyle: {
		apply: function(feature) {
			$C.fill_style(Object.value(feature.fillStyle, feature))
		}
	},
	pattern: {
		parse: function(feature, value) {
			feature.pattern = new Image()
			feature.pattern.src = Object.value(value, feature)
		},
		apply: function(feature) {
			if (!feature.pattern.src) {
				var value = feature.pattern
				feature.pattern = new Image()
				feature.pattern.src = Object.value(value, feature)
			}
			$C.fill_pattern(Object.value(feature.pattern, feature), 'repeat')
		}
	},
	strokeStyle: {
		apply: function(feature) {
			$C.stroke_style(Object.value(feature.strokeStyle, feature))
		}
	},
	opacity: {
		apply: function(feature) {
			$C.opacity(Object.value(feature.opacity, feature))
		}
	},
	lineWidth: {
		apply: function(feature) {
			$C.line_width(Object.value(feature.lineWidth, feature))
		}
	}
})
