/**
 * @namespace
 */
var Projection = {
	current_projection: 'spherical_mercator',
	scale_factor: 100000,
	set: function(new_projection) {
		this.current_projection = new_projection
	},
	lon_to_x: function(lon) { return -1*Projection[Projection.current_projection].lon_to_x(lon) },
	x_to_lon: function(x) { return Projection[Projection.current_projection].x_to_lon(x) },
	lat_to_y: function(lat) { return -1*Projection[Projection.current_projection].lat_to_y(lat) },
	y_to_lat: function(y) { return -1*Projection[Projection.current_projection].y_to_lat(y) },
	//required by spherical mercator:
	center_lon: function() { return (Cartagen.lng2+Cartagen.lng1)/2 },
	spherical_mercator: {
		lon_to_x: function(lon) { return (lon - Projection.center_lon()) * -1 * Projection.scale_factor },
		x_to_lon: function(x) { return (x/(-1*Projection.scale_factor)) + Projection.center_lon() },
		lat_to_y: function(lat) { return ((180/Math.PI * (2 * Math.atan(Math.exp(lat*Math.PI/180)) - Math.PI/2))) * Projection.scale_factor * 1.7 },
		y_to_lat: function(y) { return (180/Math.PI * Math.log(Math.tan(Math.PI/4+(y/(Projection.scale_factor*1.7))*(Math.PI/180)/2))) }
	},
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
			// unknown
		}
		
	}
}
