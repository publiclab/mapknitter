var Config = {
	init: function(config) {
		// stores passed configs and query string configs in the Config object
		Object.extend(this, config)
		
		query_params = window.location.href.toQueryParams()
		if (query_params.gss) { // for backwards compatability
			query_params.stylesheet = query_params.gss
		}
		Object.extend(this, query_params)
		
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
		
	}
}


