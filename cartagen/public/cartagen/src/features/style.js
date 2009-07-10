/**
 * @namespace Loads GSS stylesheets and applies styles to features.
 */
var Style = {
	properties: ['fillStyle', 'pattern', 'strokeStyle', 'opacity', 'lineWidth', 'outlineColor',
	             'outlineWidth', 'radius', 'hover', 'mouseDown', 'distort'],

	label_properties: ['text', 'fontColor', 'fontSize', 'fontScale', 'fontBackground',
		               'fontRotation'],
	/**
	 * Storage for loaded styles
	 * @type Object (GSS)
	 */
	styles: {
		body: {
			fillStyle: "#eee",
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
		if (Style.styles.body.fillStyle) $C.fill_style(Style.styles.body.fillStyle)
		if (Style.styles.body.opacity) $C.opacity(Style.styles.body.opacity)
		if (Style.styles.body.pattern) {
			if (!Style.styles.body.pattern.src) {
				var value = Style.styles.body.pattern
				Style.styles.body.pattern = new Image()
				Style.styles.body.pattern.src = Object.value(value)
			}
			$C.fill_pattern(Style.styles.body.pattern, 'repeat')
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
		(this.properties.concat(this.label_properties)).each(function(property) {
			var val = selector[property]

			if (Style.styles[feature.name] && Style.styles[feature.name][property])
				val = Style.styles[feature.name][property]

			feature.tags.each(function(tag) {
				if (Style.styles[tag.key] && Style.styles[tag.key][property])
					val = Style.styles[tag.key][property]

				if (Style.styles[tag.value] && Style.styles[tag.value][property])
					val = Style.styles[tag.value][property]
			})

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
		feature[property] = Object.value(feature.style_generators[property], feature)
	},
	/**
	 * Loads a remove stylesheet.
	 * @param {String} stylesheet_url URL of stylesheet
	 */
	load_styles: function(stylesheet_url) {
		if (stylesheet_url.slice(0,4) == "http") {
			stylesheet_url = "/utility/proxy?url="+stylesheet_url
		}
		new Ajax.Request(stylesheet_url,{
			method: 'get',
			onComplete: function(result) {
				$l('applying '+stylesheet_url)
				Style.apply_gss(result.responseText)
			}
		})
	},
	apply_gss: function(gss_string, force_update) {
		var styles = ("{"+gss_string+"}").evalJSON()
		$H(styles).each(function(style) {
			if (style.value.refresh) {
				$H(style.value.refresh).each(function(pair) {
					style.value[pair.key].gss_update_interval = pair.value
				})
			}
		})

		Style.styles = styles

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

