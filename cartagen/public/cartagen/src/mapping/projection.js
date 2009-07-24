/**
 * @namespace Contains functions to convert x/y to lon/lat and vice-versa. Projection can handle
 *            multiple projection systems, and the methods are abstracted so projections can
 *            be switched easily. 
 */
var Projection = {
	/**
	 * The projection system to use. "spherical_mercator" and "elliptical_mercator". Elliptical
	 * mercator does not support y to lat, so it is not recommended.
	 * @type String
	 * @default "spherical_mercator"
	 */
	current_projection: 'spherical_mercator',
	/**
	 * Now many x/y units a pixel represents.
	 * @type Number
	 * @default 100000
	 */
	scale_factor: 100000,
	/**
	 * Converts lon to x using the current projection system
	 * @param {Number} lon
	 */
	lon_to_x: function(lon) { return -1*Projection[Projection.current_projection].lon_to_x(lon) },
	/**
	 * Converts x to lo using the current projection system
	 * @param {Number} x
	 */
	x_to_lon: function(x) { return Projection[Projection.current_projection].x_to_lon(x) },
	/**
	 * Converts lat to y using the current projection system
	 * @param {Number} lat
	 */
	lat_to_y: function(lat) { return -1*Projection[Projection.current_projection].lat_to_y(lat) },
	/**
	 * Converts y to lat using the current projection system
	 * @param {Number} y
	 */
	y_to_lat: function(y) { return -1*Projection[Projection.current_projection].y_to_lat(y) },
	/**
	 * Finds the longitude of the center of the Map
	 */
	center_lon: function() { return Config.lng },
	/** @ignore */
	spherical_mercator: {
		lon_to_x: function(lon) { return (lon - Projection.center_lon()) * -1 * Projection.scale_factor },
		x_to_lon: function(x) { return (x/(-1*Projection.scale_factor)) + Projection.center_lon() },
		lat_to_y: function(lat) { return 180/Math.PI * Math.log(Math.tan(Math.PI/4+lat*(Math.PI/180)/2)) * Projection.scale_factor },
		y_to_lat: function(y) { return  180/Math.PI * (2 * Math.atan(Math.exp(y/Projection.scale_factor*Math.PI/180)) - Math.PI/2) }
	},
	/** @ignore */
	elliptical_mercator: {
		lon_to_x: function(lon) {
		    var r_major = 6378137.000;
		    return r_major * lon;
		},
		x_to_lon: function(x) {
		    var r_major = 6378137.000;
		    return lon/r_major;
		},
		lat_to_y: function(lat) {
		    if (lat > 89.5)
		        lat = 89.5;
		    if (lat < -89.5)
		        lat = -89.5;
		    var r_major = 6378137.000;
		    var r_minor = 6356752.3142;
		    var temp = r_minor / r_major;
		    var es = 1.0 - (temp * temp);
		    var eccent = Math.sqrt(es);
		    var phi = lat;
		    var sinphi = Math.sin(phi);
		    var con = eccent * sinphi;
		    var com = .5 * eccent;
		    con = Math.pow(((1.0-con)/(1.0+con)), com);
		    var ts = Math.tan(.5 * ((Math.PI*0.5) - phi))/con;
		    var y = 0 - r_major * Math.log(ts);
		    return y;
		},
		y_to_lat: function(y) {
			$D.err('y_to_lat is not supported in elliptical mercator')
		}
		
	}
}
