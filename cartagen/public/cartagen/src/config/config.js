var Config = {
	aliases: $H({
		stylesheet: ['gss']
	}),
	flags: $H({
		debug:
	})
	init: function(config) {
		// stores passed configs and query string configs in the Config object
		Object.extend(this, config)
		Object.extend(this, this.get_url_params())
		
		this.apply_aliases())
		
		// Turn on debugging mode
		if (this.debug) {
			$D.enable()
			Geohash.grid = true
		}
		
		// Turn on grid
		if (this.grid) {
			Geohash.grid = true
			if (Object.isString(this.grid)) Geohash.grid_color = this.grid
		}
	
		// Turn on fullscreen
		if (this.fullscreen && $('brief')) {
			$('brief').hide()
		}
	},
	get_url_params: function() {
		return window.location.href.toQueryParams()
	},
	apply_aliases: function() {
		this.aliases.each(function(pair) {
			pair.value.each(function(value) {
				if (this[value]) this[pair.key] = value
			})
		}, this)
	},
	
}


