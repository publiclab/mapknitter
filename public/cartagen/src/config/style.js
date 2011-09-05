/**
 * @namespace Loads GSS stylesheets and applies styles to features.
 */
var Style = {
	/**
	 * Whether any dynamic styles have been recalculated. Triggers draw.
	 * @type Boolean
	 */
	styles_changed: false,
	properties: ['fillStyle', 'pattern', 'strokeStyle', 'opacity', 'lineWidth', 'outlineColor',
	             'outlineWidth', 'radius', 'hover', 'mouseDown', 'distort', 'menu', 'image'],

	label_properties: ['text', 'fontColor', 'fontSize', 'fontScale', 'fontBackground',
		               'fontRotation'],
	/**
	 * Storage for loaded styles
	 * @type Object (GSS)
	 */
	styles: {
		body: {
			// fillStyle: "#eee",
			fontColor: "#eee",
			fontSize: 12,
			fontRotation: 0,
			opacity: 1
		}
	},
	/**
	 * Applies the global "body" styles
	 */
	 style_body: function() {
		if (!Config.tiles && Style.styles.body.fillStyle) $C.fill_style(Style.styles.body.fillStyle)
		if (Style.styles.body.opacity) $C.opacity(Style.styles.body.opacity)
		
		if (!Config.tiles && Style.styles.body.pattern) {
			if (!Style.styles.body.pattern.src) {
				var value = Style.styles.body.pattern
				Style.styles.body.pattern = new Image()
				Style.styles.body.pattern.src = Object.value(value)
			}
			$C.open('main')
			$C.fill_pattern(Style.styles.body.pattern, 'repeat')
			$C.rect(0,0,Glop.width,Glop.height)
		}
		$C.close()
	},
	/**
	 * Take styles from GSS and set appropriate properties of a feature
	 * @param {Object} feature  Feature to set properties of
	 * @param {Object} selector A set of default properties to set first, before parsing styles
	 *                          that apply to tags of the feature.
	 */
	parse_styles: function(feature,selector) {
		(this.properties.concat(this.label_properties)).each(function(property) {
			var val = null
			if (selector) val = selector[property]

			if (Style.styles[feature.name] && Style.styles[feature.name][property])
				val = this.extend_value(val, Style.styles[feature.name][property])

			feature.tags.each(function(tag) {
				if (Style.styles[tag.key] && Style.styles[tag.key][property]) {
					val = this.extend_value(val, Style.styles[tag.key][property])
				}

				if (Style.styles[tag.value] && Style.styles[tag.value][property]) {
					val = this.extend_value(val, Style.styles[tag.value][property])
				}
			}, this)

			if (val) {
				var f = feature
				if (this.label_properties.include(property)) {
					f = feature.label
				}

				if (val.gss_update_interval) {
					Style.create_refresher(f, property, val, val.gss_update_interval)
				}
				else {
					f[property] = Object.value(val, feature)
				}
			}
		}, this)
	},
	/**
	 * If old_val and new_val are arrays, returns the two arrays, merged. Else, returns
	 * new_val.
	 */
	extend_value: function(old_val, new_val) {
		if (old_val instanceof Array && new_val instanceof Array) {
			return old_val.concat(new_val)
		}
		
		return new_val
	},
	/**
	 * Creates a periodical executer that updates a property
	 * @param {Feature}  feature   Feature to update
	 * @param {String}   property  Property to update
	 * @param {Function} generator Fuction that generated the value for the property
	 * @param {Number}   interval  Number of seconds between updates
	 */
	create_refresher: function(feature, property, generator, interval) {
		if(!feature.style_generators) feature.style_generators = {}
		if(!feature.style_generators.executers) feature.style_generators.executers = {}

		feature.style_generators[property] = generator

		Style.refresh_style(feature, property)
		feature.style_generators.executers[property] = new PeriodicalExecuter(function() {
			Style.refresh_style(feature, property)
		}, interval)
	},
	/**
	 * Refreshes a property from its generator
	 * @param {Feature} feature  Feature to update
	 * @param {String}  property Property to update
	 */
	refresh_style: function(feature, property) {
		Style.styles_changed = true
		feature[property] = Object.value(feature.style_generators[property], feature)
	},
	/**
	 * Loads a remove stylesheet.
	 * @param {String} stylesheet_url URL of stylesheet
	 */
	load_styles: function(stylesheet_url) {
		var orig_url = stylesheet_url
		$l('loading '+stylesheet_url)
		if (stylesheet_url.slice(0,4) == "http") {
			stylesheet_url = "/utility/proxy?url="+stylesheet_url
		}
		new Ajax.Request(stylesheet_url,{
			method: 'get',
			onComplete: function(result) {
				$l('applying '+stylesheet_url)
				Style.apply_gss(result.responseText)
				Glop.fire('styles:loaded')
				Glop.fire('styles:loaded:'+orig_url)
			}
		})
	},
	/**
	 * Cascades a set of styles over another set. More or less merges the two.
	 * @param {Object} old_styles Existing styles over which to cascade
	 * @param {Object} new_styles Additional styles to cascade over old ones
	 */
	cascade: function(old_styles,new_styles) {
		// overwrite existing selectors, read as hash:
		$l('cascading')
		// $l(old_styles)
		// $l(new_styles)
		$l('both')
		$H(old_styles).each(function(selector) {
			if (new_styles[selector.key]) {
				$H(selector.value).each(function(style) {
					if (new_styles[selector.key][style.key]){
						old_styles[selector.key][style.key] = new_styles[selector.key][style.key]
					}
				})
			}
			// add new styles
			// $l(selector.key)
			if (new_styles[selector.key]) {
				// $l(selector.key)
				$H(new_styles[selector.key]).each(function(new_style) {
					old_styles[selector.key][new_style.key] = new_style.value
				})
			}
		})
		// add new selectors
		$H(new_styles).each(function(style) {
			if (!old_styles[style.key]) old_styles[style.key] = style.value
		})
	},
	/**
	 * Copies each style from a gss string into the Styles.styles object, 
	 * which is the master 'merged' style storage for the map
	 * @param {String} gss_string
	 * @param {Boolean} force_update Whether to force all objects in the 
	 * 			map to refresh with the new styles
	 */
	apply_gss: function(gss_string, force_update) {
		$l('applying gss')
		var styles = ("{"+gss_string+"}").evalJSON()
		
		if (styles.debug) {
			if (Config.debug) {
				Object.deep_extend(styles, styles.debug)
			}
			delete styles.debug
		}
		
		// convert to a hash and iterate over:
		$H(styles).each(function(style) {
			if (style.value.refresh) {
				$H(style.value.refresh).each(function(pair) {
					style.value[pair.key].gss_update_interval = pair.value
				})
			}
			if (style.value.menu) {
				if (style.key == "body") {
					$H(style.value.menu).each(function(pair) {
						ContextMenu.add_static_item(pair.key, pair.value)
					})
				} else {
					$H(style.value.menu).each(function(pair) {
						style.value.menu[pair.key] = ContextMenu.add_cond_item(pair.key, pair.value)
					})
					style.value.menu = Object.values(style.value.menu)
				}
			}
		})
		Style.cascade(Style.styles,styles)

		if ($('gss_textarea')) {
			$('gss_textarea').value = gss_string
		}
		
		if (force_update) {
			Geohash.each(function(o) {
				o.refresh_styles()
			})
		}
	}
}

