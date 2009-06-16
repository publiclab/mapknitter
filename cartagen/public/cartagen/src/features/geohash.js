/**
 * @namespace
 * Contains methods and variables for spacially indexing features using
 * geohashes.
 */
var Geohash = {
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
	 * If true, a grid of geohashes is drawn on the map
	 * @type Boolean
	 */
	grid: false,
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
	 * Once-per-frame calls to regenerate objects, etc.
	 * @see Geohash.get_objects
	 */
	draw: function() {
		this.get_objects()
	},
	/**
	 * Adds a feature to a geohash index. Use put_object() to automatically
	 * calculate latitude, longitude, and appropriate geohash length.
	 * @param {Number} lat      Latitude of feature
	 * @param {Number} lon      Longitude of feature
	 * @param {Feature} feature The feature
	 * @param {NUmber} length   Length of geohash
	 * @see Geohash.put_object
	 */
	put: function(lat,lon,feature,length) {
		if (!length) length = this.default_length
		var key = Geohash.get_key(lat,lon,length)
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
		Geohash.put(Projection.y_to_lat(feature.y),Projection.x_to_lon(feature.x),feature,Geohash.get_key_length(feature.width,feature.height)-1)
	},
	/**
	 * Generates a geohash.
	 * @param {Number} lat    Latitude to hash
	 * @param {Number} lon    Longitude to hash
	 * @param {Number} length Length of hash
	 */
	get_key: function(lat,lon,length) {
		if (!length) length = this.default_length
		if (length < 1) length = 1
		return encodeGeoHash(lat,lon).truncate(length,"")
	},
	/**
	 * Fetch features in a geohash
	 * @param {Number} lat    Latitude of geohash
	 * @param {Number} lon    Longitude of geohash
	 * @param {Number} length Geohash length
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
	 * @see Geohash.get
	 * @see Geohash.get_upward
	 */
	get_from_key: function(key) {
		// this.draw_bbox(key)
		var result = this.hash.get(key)
		if (result) return result
		else return []
	},
	/**
	 * Fetch features in a geohash from a geohash key, and all shorter keys
	 * @param {Object} key Geohash to find features from
	 * @see Geohash.get
	 * @see Geohash.get_from_key
	 * @see Geohash.get_keys_upward
	 */ 
	get_upward: function(key) {
		if (key.length > this.limit_bottom) key.truncate(this.limit_bottom,'')
		// this.draw_bbox(key)
		var this_level = this.hash.get(key)
		if (this_level && key.length > 0) {
			// Cartagen.debug(key+': '+this_level.length)
			if (key.length > 1) return this_level.concat(this.get_upward(key.truncate(key.length-1,"")))
			else return this_level
		} else {
			// Cartagen.debug(key+': 0')
			if (key.length > 1) return this.get_upward(key.truncate(key.length-1,""))
			else return []
		}
	},
	/** 
	 * Fetch keys in a geohash from a geohash key, and all shorter keys.
	 * Checks for redundancy against a hash of keys.
	 * @param {String} key Geohash to get keys from.
	 * @see Geohash.get_upward
	 */
	get_keys_upward: function(key) {
		if (key.length > this.limit_bottom) key.truncate(this.limit_bottom,'')
		if (key.length > 0) {
			// this.draw_bbox(key)
			Geohash.keys.set(key,true)
			k = key.truncate(key.length-1,"")
			if (key.length > 1 && !Geohash.keys.get(k)) {
				this.get_keys_upward(k)
			}
		}
	},
	/**
	 * Fetch adjacent geohashes
	 * @param {String} key Central geohash
	 */ 
	get_neighbors: function(key) {
		var neighbors = []
		var dirs = ['top','bottom','left','right']
		dirs.each(function(dir) {
			var n_key = calculateAdjacent(key,dir)
			var n_array = this.get_from_key(n_key)
			if (n_array) neighbors = neighbors.concat(n_array)
			// Cartagen.debug("n_key: "+n_key)
		},this)
		// Cartagen.debug('neighbors of '+key+': '+neighbors.length)
		return neighbors
	},
	/**
	 *  Given a geohash key, recurses outwards to neighbors while still within the viewport
	 *  @param {String}                   key  Central geohash
	 *  @param {Hash (String -> Boolean)} keys Hash of keys and whether they have been included in search
	 **/
	fill_bbox: function(key,keys) {
		var dirs = ['top','bottom','left','right']
		// we may be able to improve efficiency by only checking certain directions
		dirs.each(function(dir) {
			var k = calculateAdjacent(key,dir)
			if (!keys.get(k)) {
				keys.set(k,true)
				// if still inside viewport:
				var bbox = decodeGeoHash(k) //[lon1, lat2, lon2, lat1]
				if (in_range(bbox.latitude[2],Map.bbox[3],Map.bbox[1]) && in_range(bbox.longitude[2],Map.bbox[0],Map.bbox[2])) this.fill_bbox(k,keys)
				// if (Geometry.overlaps(bbox.latitude[2],bbox.longitude[2],Map.lat,Map.lon,Math.min(Map.lat_height,Map.lon_width)/2)) this.fill_bbox(k,keys)
				this.draw_bbox(k)
			}
		},this)
	},
	/**
	 * Prints debugging information to the console
	 */
	trace: function() {
		this.hash.keys().each(function(key) {
			Cartagen.debug(key+': '+this.hash.get(key).length)
		},this)
		return this.hash.size()
	},
	/**
	 * Returns the bounding box of a geohash
	 * @param {String} geohash Geohash to get bounding box of
	 */
	bbox: function(geohash) {
		var geo = decodeGeoHash(geohash)
		return [geo.longitude[0],geo.latitude[1],geo.longitude[1],geo.latitude[0]]
	},
	/**
	 * Draws the bounding box of a geohash
	 * @param {String} key Geohash to draw bounding box of 
	 */
	draw_bbox: function(key) {
		if (Geohash.grid) {
			var bbox = this.bbox(key)
			canvas.lineWidth = 1/Cartagen.zoom_level
			$C.stroke_style('rgba(0,0,0,0.5)')
			// Cartagen.debug(key.length+": "+(bbox[2]-bbox[0])+","+(bbox[1]-bbox[3]))
			var width = (Projection.lon_to_x(bbox[2])-Projection.lon_to_x(bbox[0]))
			var height = (Projection.lat_to_y(bbox[1])-Projection.lat_to_y(bbox[3]))
			$C.stroke_rect(-width-Projection.lon_to_x(bbox[0]),Projection.lat_to_y(bbox[3]),width,height)
			$C.fill_style('rgba(0,0,0,0.5)')
			canvas.font = (9/Cartagen.zoom_level)+"pt Helvetica"
			canvas.fillText(key,-width-Projection.lon_to_x(bbox[0])+3/Cartagen.zoom_level,Projection.lat_to_y(bbox[3])-3/Cartagen.zoom_level)
			// Cartagen.debug(key+": xy_rect: "+Projection.lon_to_x(bbox[0])+","+Projection.lat_to_y(bbox[3])+","+(Projection.lon_to_x(bbox[2])-Projection.lon_to_x(bbox[0]))+","+(Projection.lat_to_y(bbox[1])-Projection.lat_to_y(bbox[3])))
			// Cartagen.debug(key+': latlon_rect: '+bbox[0]+','+bbox[3]+','+bbox[2]+','+bbox[1])
		}
	},
	/**
	 * Gets an appropriate key length for a ceratin size of feature
	 * @param {Object} lat Width, in degrees of latitude, of feature
	 * @param {Object} lon Height, in degrees of longitude, of feature
	 */
	get_key_length: function(lat,lon) {
		if (lon < 0.0000003357) lon_key = 12
		else if (lon < 0.000001341) lon_key = 11
		else if (lon < 0.00001072) lon_key = 10
		else if (lon < 0.00004291) lon_key = 9
		else if (lon < 0.0003433) lon_key = 8
		else if (lon < 0.001373) lon_key = 7
		else if (lon < 0.01098) lon_key = 6
		else if (lon < 0.04394) lon_key = 5
		else if (lon < 0.3515) lon_key = 4
		else if (lon < 1.406) lon_key = 3
		else if (lon < 11.25) lon_key = 2
		else if (lon < 45) lon_key = 1
		else lon_key = 0 // eventually we can map the whole planet at once
		
		if (lat < 0.0000001676) lat_key = 12
		else if (lat < 0.000001341) lat_key = 11
		else if (lat < 0.000005364) lat_key = 10
		else if (lat < 0.00004291) lat_key = 9
		else if (lat < 0.0001716) lat_key = 8
		else if (lat < 0.001373) lat_key = 7
		else if (lat < 0.005493) lat_key = 6
		else if (lat < 0.04394) lat_key = 5
		else if (lat < 0.1757) lat_key = 4
		else if (lat < 1.40625) lat_key = 3
		else if (lat < 5.625) lat_key = 2
		else if (lat < 45) lat_key = 1
		else lat_key = 0 // eventually we can map the whole planet at once
		return Math.min(lat_key,lon_key)
	},
	/**
	 * Generates Geohash.objects, populating it with the objects that
	 * should be drawn this frame.
	 * @see Geohash.objects
	 */
	get_objects: function() {
		this.objects = []

		// get geohash for each of the 4 corners,
		this.keys = new Hash
		this.key_length = Geohash.get_key_length(0.0015/Cartagen.zoom_level,0.0015/Cartagen.zoom_level)
		
		this.key = Geohash.get_key(Map.lat,Map.lon,this.key_length)
		
		var bbox = decodeGeoHash(this.key) //[lon1, lat2, lon2, lat1]
		
		this.fill_bbox(this.key,this.keys)
		this.get_keys_upward(this.key)

		this.keys.keys().each(function(key,index) {
			this.get_keys_upward(key)
		},this)
		
		this.keys.keys().each(function(key) {
			this.objects = this.objects.concat(this.get_from_key(key))
		},this)
		
		// reverse because smaller objects are added first:
		return this.objects.reverse()
	}
}