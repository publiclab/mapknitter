/**
 * @namespace Contains methods and variables for spacially indexing features using geohashes.
 */
var Geohash = {}

Object.extend(Geohash, Enumerable)

Object.extend(Geohash, {
	_dirs: ['top','bottom','left','right'],
	/**
	 * Map of geohashes -> features
	 * @type Hash (String -> Feature[])
	 */
	hash: new Hash(),
	/**
	 * Array of all objects that should be drawn for the current frame
	 * @type Feature[]
	 */
	objects: [],
	/**
	 * A subset of Geohash.hash that contains only features that should be drawn for
	 * the current frame.
	 */
	object_hash: new Hash(),
	/**
	 * If true, a grid of geohashes is drawn on the map
	 * @type Boolean
	 */
	grid: false,
	/**
	 * Color of the grid of geohashes to be drawn on the map
	 * @type String
	 */
	grid_color: 'black',
	/**
	 * Default length for a geohash, if none is specified or calculated. Note that
	 * put_object() will automatically calculate an appropriate geohash for the feature,
	 * so this only affects put().
	 * @type Number
	 */
	default_length: 6, // default length of geohash
	/**
	 * The largest allowable geohash length
	 * @type Number
	 */
	limit_bottom: 8, // 12 is most ever...
	/**
	 * position when Geohash.get_objects() was last run; in format: [x,y,zoom,force]
	 */
	last_get_objects: [0,0,0,false],
	/**
	 * Frame the last plot was loaded on
	*/
	last_loaded_geohash_frame: 0,
	/**
	 * Binds to events
	 */
	init: function() {
		$('canvas').observe('cartagen:predraw', this.draw.bindAsEventListener(this))
		$('canvas').observe('cartagen:postdraw', this.draw_bboxes.bindAsEventListener(this))
	},
	/**
	 * Recalculates which geohashes to request based on the viewport; formerly called every 
	 * frame, but now only when viewport changes.
	 * @see Geohash.get_objects
	 */
	draw: function() {
		if (this.last_get_objects[3] || Geohash.objects.length == 0 || Map.zoom/this.last_get_objects[2] > 1.1 || Map.zoom/this.last_get_objects[2] < 0.9 || Math.abs(this.last_get_objects[0] - Map.x) > 100 || Math.abs(this.last_get_objects[1] - Map.y) > 100) {
		// if (Geohash.objects.length == 0 || Math.abs(this.last_get_objects[0] - Map.x) > 50 || Math.abs(this.last_get_objects[1] - Map.y) > 50) {
			this.get_objects()
			this.last_get_objects[3] = false
			//$l('re-getting-objects')
			Cartagen.last_loaded_geohash_frame = Glop.frame
		}
	},
	/**
	 * Adds a feature to a geohash index. Use put_object() to automatically
	 * calculate latitude, longitude, and appropriate geohash length.
	 * @param {Number} lat      Latitude of feature
	 * @param {Number} lon      Longitude of feature
	 * @param {Feature} feature The feature
	 * @param {Number} length   Length of geohash
	 * @see Geohash.put_object
	 */
	put: function(lat,lon,feature,length) {
		if (!length) length = this.default_length
		var key = this.get_key(lat,lon,length)
		
		// check to see if the geohash is already populated:
		var merge_hash = this.hash.get(key)
		if (!merge_hash) {
			merge_hash = [feature]
		} else {
			merge_hash.push(feature)
		}
		
		this.hash.set(key,merge_hash)
	},
	/**
	 * Puts a feature into the geohash index. Finds latitude and longitude from
	 * feature's x and y, and calculates an appropriate geohash based on
	 * size of feature and size of canvas. Use put() to manually specify latitude,
	 * longitude, and geohash length.
	 * @param {Feature} feature
	 * @see Geohash.put
	 * @see Geohash.get_key_length
	 */
	put_object: function(feature) {
		this.put(Projection.y_to_lat(feature.y),
		         Projection.x_to_lon(-feature.x),
		         feature,
		         this.get_key_length(feature.width,feature.height))
	},
	/**
	 * Generates a geohash.
	 * @param {Number} lat    Latitude to hash
	 * @param {Number} lon    Longitude to hash
	 * @param {Number} length Length of hash
	 * @return The generated geohash, truncated to the specified length
	 * @type String
	 */
	get_key: function(lat,lon,length) {
		if (!length) length = this.default_length
		if (length < 1) length = 1
		
		return encodeGeoHash(lat,lon).truncate(length,'')
	},
	/**
	 * Fetch features in a geohash
	 * @param {Number} lat    Latitude of geohash
	 * @param {Number} lon    Longitude of geohash
	 * @param {Number} length Geohash length
	 * @return Features in the same geohash as the specified location
	 * @type Feature[]
	 * @see Geohash.get_from_key
	 * @see Geohash.get_upward
	 */ 
	get: function(lat,lon,length) {
		if (!length) length = this.default_length
		
		var key = this.get_key(lat,lon,length)
		return this.hash.get(key)
	},
	/**
	 * Gets features in a geohash.
	 * @param {Number} key Geohash to find features from
	 * @return Features in the specified geohash, or an empty array
	 * @type Feature[]
	 * @see Geohash.get
	 * @see Geohash.get_upward
	 */
	get_from_key: function(key) {
		return this.hash.get(key) || []
	},
	/**
	 * Fetch features in a geohash from a geohash key, and all shorter keys
	 * @param {Object} key Geohash to find features from
	 * @return Features in this and shorter geohashes, or an empty array
	 * @type Feature[]
	 * @see Geohash.get
	 * @see Geohash.get_from_key
	 * @see Geohash.get_keys_upward
	 */ 
	get_upward: function(key) {
		key.truncate(this.limit_bottom,'')

		var this_level = this.hash.get(key)
		
		if (this_level && key.length > 0) {
			if (key.length > 1) return this_level.concat(this.get_upward(key.truncate(key.length-1),''))
			else return this_level
		} else {
			if (key.length > 1) return this.get_upward(key.truncate(key.length-1),'')
			else return []
		}
	},
	/** 
	 * Fetch keys in a geohash from a geohash key, and all shorter keys, and place
	 * then in Geohash.keys. Ensures that only one copy of a key will
	 * be in Geohash.keys.
	 * @param {String} key Geohash to get keys from.
	 * @see Geohash.get_upward
	 */
	get_keys_upward: function(key) {
		key.truncate(this.limit_bottom,'')
		
		if (key.length > 0) {
			this.keys.set(key, true)
			k = key.truncate(key.length-1,'')
			if (key.length > 1 && !Geohash.keys.get(k)) {
				this.get_keys_upward(k)
			}
		}
	},
	/**
	 * Gets all features that should be drawn in the current frame that are in the specified
	 * key and all shorter keys.
	 * @param {String} key Geohash to look in
	 * @type Feature[]
	 */
	get_current_features_upward: function(key) {
		keys = []
		for (var i=this.limit_bottom; i > 0; i--) {
			keys.push(key.truncate(i, ''))
		}
		features =  []
		keys.each(function(k) {
			if (this.object_hash.get(k)) features = this.object_hash.get(k).concat(features)
		}, this)
		return features
	}, 
	/**
	 * Gets the eights neighboring keys of the specified key, including diagonal neighbors.
	 * @param {String} key Central geohash
	 * @return Array of neighbors, starting from the key directly above the central key and
	 *         proceeding clockwise.
	 * @type String[]
	 * 
	 */
	get_all_neighbor_keys: function(key) {
		var top = calculateAdjacent(key, 'top')
		var bottom = calculateAdjacent(key, 'bottom')
		var left = calculateAdjacent(key, 'left')
		var right = calculateAdjacent(key, 'right')
		var top_left = calculateAdjacent(top, 'left')
		var top_right = calculateAdjacent(top, 'right')
		var bottom_left = calculateAdjacent(bottom, 'left')
		var bottom_right = calculateAdjacent(bottom, 'right')
		return [top, top_right, right, bottom_right, bottom, bottom_left, left, top_left]
	},
	/**
	 * Fetch adjacent geohashes
	 * @param {String} key Central geohash
	 * @return Array of neighbors
	 * @type Feature[]
	 */ 
	get_neighbors: function(key) {
		var neighbors = []

		this._dirs.each(function(dir) {
			var n_key = calculateAdjacent(key, dir)
			var n_array = this.get_from_key(n_key)
			if (n_array) neighbors = neighbors.concat(n_array)
		}, this)

		return neighbors
	},
	/**
	 *  Given a geohash key, recurses outwards to neighbors while still within the viewport
	 *  @param {String}                   key  Central geohash
	 *  @param {Hash (String -> Boolean)} keys Hash of keys and whether they have been included in
	 *                                         search
	 **/
	fill_bbox: function(key,keys) {
		// we may be able to improve efficiency by only checking certain directions
		this.get_all_neighbor_keys(key).each(function(k) {
			if (!keys.get(k)) {
				keys.set(k, true)
				
				// if still inside viewport:
				var bbox = decodeGeoHash(k) //[lon1, lat2, lon2, lat1]
				if (Math.in_range(bbox.latitude[0],Map.bbox[3],Map.bbox[1]) &&
					Math.in_range(bbox.latitude[1],Map.bbox[3],Map.bbox[1]) &&
				    Math.in_range(bbox.longitude[0],Map.bbox[0],Map.bbox[2]) &&
					Math.in_range(bbox.longitude[1],Map.bbox[0],Map.bbox[2])) {
						this.fill_bbox(k,keys)
				}
			}
		}, this)
	},
	/**
	 * Prints debugging information to the console
	 * @return Number of registered geohashes
	 * @type Number
	 */
	trace: function() {
		var lengths = new Hash
		this.hash.keys().each(function(key) {
			$l(key+': '+this.hash.get(key).length)
			if (!lengths.get(key.length)) lengths.set(key.length,0)
			lengths.set(key.length,lengths.get(key.length)+1)
		}, this)
		
		$l('Lengths >>')
		
		lengths.keys().sort().each(function(length) {
			$l(length+": "+lengths.get(length))
		})
		
		return this.hash.size()
	},
	/**
	 * Returns the bounding box of a geohash
	 * @param {String} geohash Geohash to get bounding box of
	 * @return Bounding box of geohash, in [lon_1, lat_2, lon_ 2, lat_1] format
	 * @type Number[]
	 */
	bbox: function(geohash) {
		var geo = decodeGeoHash(geohash)
		return [geo.longitude[0],geo.latitude[1],geo.longitude[1],geo.latitude[0],geohash]
	},
	/**
	 * Draws the bounding box of a geohash
	 * @param {String} key Geohash to draw bounding box of 
	 */
	draw_bbox: function(key) {
		var bbox = this.bbox(key)

		var line_width = 1/Map.zoom
		// line_width < 1
		$C.line_width(Math.max(line_width,1))
		$C.stroke_style(this.grid_color)

		var width = Projection.lon_to_x(bbox[2]) - Projection.lon_to_x(bbox[0])
		var height = Projection.lat_to_y(bbox[1]) - Projection.lat_to_y(bbox[3])

		$C.stroke_rect(Projection.lon_to_x(bbox[0]),
					   Projection.lat_to_y(bbox[3]),
					   width,
					   height)
		$C.save()
		$C.translate(Projection.lon_to_x(bbox[0]),Projection.lat_to_y(bbox[3]))
		$C.fill_style(Object.value(this.fontBackground))
		var height = 16 / Map.zoom
		var width = $C.measure_text('Lucida Grande', 
		                            height,
		                            key)
		var padding = 2
		// $C.fill_style('white')
		// $C.rect(-padding/2, 
		// 		-(height + padding/2), 
		// 		width + padding + 3/Map.zoom,
		//         height + padding - 3/Map.zoom)
		$C.draw_text('Lucida Grande',
					 height,
					 this.grid_color,
					 3/Map.zoom,
					 -3/Map.zoom,
					 key)
		$C.restore()
	},
	draw_bboxes: function() {
		if (Geohash.grid) {
			this.keys.keys().each(function(key){
				Geohash.draw_bbox(key)
			})
		}
	},
	/**
	 * Gets an appropriate key length for a ceratin size of feature
	 * @param {Object} lat Width, in degrees of latitude, of feature
	 * @param {Object} lon Height, in degrees of longitude, of feature
	 * @return Appropriate length of key
	 * @type Number
	 */
	get_key_length: function(lat,lon) {
		if      (lon < 0.0000003357) lon_key = 12
		else if (lon < 0.000001341)  lon_key = 11
		else if (lon < 0.00001072)   lon_key = 10
		else if (lon < 0.00004291)   lon_key = 9
		else if (lon < 0.0003433)    lon_key = 8
		else if (lon < 0.001373)     lon_key = 7
		else if (lon < 0.01098)      lon_key = 6
		else if (lon < 0.04394)      lon_key = 5
		else if (lon < 0.3515)       lon_key = 4
		else if (lon < 1.406)        lon_key = 3
		else if (lon < 11.25)        lon_key = 2
		else if (lon < 45)           lon_key = 1
		else                         lon_key = 0 // eventually we can map the whole planet at once
		
		if      (lat < 0.0000001676) lat_key = 12
		else if (lat < 0.000001341)  lat_key = 11
		else if (lat < 0.000005364)  lat_key = 10
		else if (lat < 0.00004291)   lat_key = 9
		else if (lat < 0.0001716)    lat_key = 8
		else if (lat < 0.001373)     lat_key = 7
		else if (lat < 0.005493)     lat_key = 6
		else if (lat < 0.04394)      lat_key = 5
		else if (lat < 0.1757)       lat_key = 4
		else if (lat < 1.40625)      lat_key = 3
		else if (lat < 5.625)        lat_key = 2
		else if (lat < 45)           lat_key = 1
		else                         lat_key = 0 // eventually we can map the whole planet at once
		
		return Math.min(lat_key,lon_key)
	},
	/**
	 * Generates Geohash.objects, populating it with the objects that
	 * should be drawn this frame.
	 * @return Geohash.objects, in reverse order
	 * @type Feature[]
	 * @see Geohash.objects
	 */
	get_objects: function() {
		this.last_get_objects = [Map.x,Map.y,Map.zoom]
		this.objects = []

		// get geohash for each of the 4 corners,
		this.keys = new Hash
		
		this.key_length = this.get_key_length(0.0015/Map.zoom, 0.0015/Map.zoom)
		
		this.key = this.get_key(Map.lat, Map.lon, this.key_length)
		
		var bbox = decodeGeoHash(this.key) //[lon1, lat2, lon2, lat1]
		
		this.fill_bbox(this.key, this.keys)
		this.get_keys_upward(this.key)

		this.keys.keys().each(function(key, index) {
			this.get_keys_upward(key)
		}, this)

		//var quota = Geohash.feature_quota()


		// This should be re-added for 0.6 release

		// sort by key length

//		var lengths = {}
//		this.keys.keys().each(function(key) {
//			if (!lengths[key.length]) lengths[key.length] = []
//
//			lengths[key.length].push(Geohash.get_from_key(key))
//		})
//
//		for (i = 1; i <= this.key_length && quota > 0; ++i) {
//			var features = lengths[i].flatten()
//			if (quota >= features.length) {
//				this.objects = this.objects.concat(features)
//				quota -= features.length
//			}
//			else {
//				j = 0
//				while (quota > 0) {
//					var o = lengths[i][j % (lengths[i].length)].shift()
//					if (o) this.objects.push(o)
//					++j
//					--quota
//				}
//			}
//		}
		var features;
		this.keys.keys().each(function(key) {
				features = this.get_from_key(key)
				this.object_hash.set(key, features)
				this.objects = features.concat(this.objects)
		}, this)
		
		this.sort_objects()

		//$l(this.objects.length)
		return this.objects
	},
	sort_objects: function() {
		this.objects.sort(Geometry.sort_by_area)
	},
	/**
	 * Calculates the appropritate density of features based on the hardware' power (estimated by screen
	 * resolution).
	 * @return The density, in features per 1,000 square pixels.
	 */
	feature_density: function() {
		return 2 * Viewport.power()
	},
	/**
	 * Calculates the number of features that should be drawn.
	 */
	feature_quota: function() {
		return ((Glop.width * Glop.height) * (Geohash.feature_density() / 1000)).round()
	},
	/**
	 * Iterator for prototype.
	 */
	_each: function(f) {
		this.hash.each(function(pair) {
			pair.value.each(function(val) { f(val) })
		})
	}
})



document.observe('cartagen:init', Geohash.init.bindAsEventListener(Geohash))
