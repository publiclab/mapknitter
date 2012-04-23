var Knitter = {
	// start storing a layer_type and layer_url in Map model, use it to switch this:
	openlayers_on: false,
	save: {
		state: true,
		saved: function(response) {
			Knitter.save.state = true
			$('save_saved').show()
			$('save_saving').hide()
			$('save_failed').hide()
			//console.log(response)
		},
		submitted: function(response) {
			Knitter.save.state = "saving"
			$('save_saved').hide()
			$('save_saving').show()
			$('save_failed').hide()
		},
		failed: function(response) {
			Knitter.save.state = false
			$('save_saved').hide()
			$('save_saving').hide()
			$('save_failed').show()
			//console.log(response)
		},
	},
	setup: function() {
		Glop.observe('pan:mouseup', function () {
			Knitter.save_current_location()
		})
		Glop.observe('glop:predraw', function() { $C.clear();})
		// disable default "delete" key (in Chrome it goes "back")
		window.addEventListener ('keydown', function (e) {
			// If the key pressed was a backspace key, handle it specially
			if (e.keyIdentifier == 'U+0008' || e.keyIdentifier == 'Backspace') {
				// If the target of the backspace was the body element, handle it specially
				if (e.target == document.body) {
					// Prevent the default Backspace action from happening
					e.preventDefault ();
				}
			}
		}, true);

		var first_new_image = true
		warpables.each(function(warpable,index) {
			if (warpable.nodes != 'none') {
				// nodes as [[lon,lat],[lon,lat]]
				Warper.load_image(warpable.img,warpable.nodes,warpable.id,warpable.locked);
			} else {
				if (first_new_image) Warper.new_image(warpable.img,warpable.id,true);
				else Warper.new_image(warpable.img,warpable.id,true)
				first_new_image = false
			}
		})
		Warper.sort_images()
		Knitter.center_on_warpables()
		if (Config.fullscreen) {
			$('header').hide()
			Config.padding_top = 0
		}
		if (Config.locked == 'true') {
			Warper.locked = true
		}
	},
	init_openlayers: function(format) {
		if (format == 'WMS') {
		       	map = new OpenLayers.Map('map', { controls: [], 
				projection: spher_merc,
   			displayProjection: spher_merc,
       				maxExtent: new OpenLayers.Bounds(-180,-90,180,90),	
			});
		} else {
		       	map = new OpenLayers.Map('map', { controls: [], 
	  			tileOrigin: new OpenLayers.LonLat(0,0).transform(latlon,spher_merc),
		    units: "m",
				projection: latlon,
   			displayProjection: spher_merc,
       				maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34),
				maxResolution: 156543.0339
			});
		}
		Knitter.openlayers_on = true;
	},

	start_openlayers: function(layer,tile_url,tile_layer) {
		if (layer == "none") $('map').hide()
		else $('map').show()
		if (!Knitter.openlayers_on) Knitter.init_openlayers(layer)
		// http://isse.cr.usgs.gov/ArcGIS/services/Combined/TNM_Large_Scale_Imagery/MapServer/WMSServer?request=GetCapabilities&service=WMS
		// http://raster.nationalmap.gov/ArcGIS/rest/services/Combined/TNM_Large_Scale_Imagery/MapServer
		// http://viewer.nationalmap.gov/example/services.html
		Config.tiles = true
		Config.tile_type = layer
		Zoom.interval = 6 
		if (layer == 'google') {
			var gsat = new OpenLayers.Layer.Google("Google Satellite", {
				type: G_SATELLITE_MAP, 
				sphericalMercator: true, 
				numZoomLevels: 23,
				maxZoomLevel: 22,
			        resolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
		          19567.87923828125, 9783.939619140625, 4891.9698095703125,
		          2445.9849047851562, 1222.9924523925781, 611.4962261962891,
    		      305.74811309814453, 152.87405654907226, 76.43702827453613,
        		  38.218514137268066, 19.109257068634033, 9.554628534317017,
		          4.777314267158508, 2.388657133579254, 1.194328566789627,
		          0.5971642833948135, 0.25, 0.1, 0.05],
				serverResolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
	                19567.87923828125, 9783.939619140625,
	                4891.9698095703125, 2445.9849047851562,
	                1222.9924523925781, 611.4962261962891,
	                305.74811309814453, 152.87405654907226,
	                76.43702827453613, 38.218514137268066,
	                19.109257068634033, 9.554628534317017,
	                4.777314267158508, 2.388657133579254,
	                1.194328566789627, 0.5971642833948135]
			} );
			map.addLayer(gsat)
		} else if (layer == 'mapbox') {
			var mapbox = new OpenLayers.Layer.TMS( "MapBox OpenStreetMap",
				[ "http://a.tile.mapbox.com/","http://b.tile.mapbox.com/",
					"http://c.tile.mapbox.com/","http://d.tile.mapbox.com/" ],
				{ 'layername': 'mapbox.mapbox-streets', 'type':'jpg',
					'buffer': 0, 'transitionEffect':'resize', 
					attribution: 'rendered by <a href="http://mapbox.com">MapBox</a>, from <a href="http://www.openstreetmap.org/">OpenStreetMap data</a>'} );
			map.addLayer(mapbox)
		} else if (layer == 'osm') {
			var osm = new OpenLayers.Layer.TMS( "OpenStreetMap",
	    			"http://tile.openstreetmap.org/",
	    			{ type: 'png', 
				numZoomLevels: 23,
				maxZoomLevel: 22,
				getURL: osm_getTileURL, 
				displayOutsideMaxExtent: true, 
				attribution: '<a href="http://www.openstreetmap.org/">OpenStreetMap</a>'
				} 
			);
			map.addLayer(osm)
		} else if (layer == 'bing') {
			var apiKey = "AhYrUtF-jMIlTiblfgB_spQXBgc3u1_4h1mrgm_vEmyrnHLbA8v8452MolECULTX"
			//Only in later versions of OpenLayers: //var bingsat = new OpenLayers.Layer.Bing("Aerial", {type: "Aerial", apiKey:apiKey, sphericalMercator:true});
			var bingsat = new OpenLayers.Layer.VirtualEarth("Virtual Earth Aerial",	{'type': VEMapStyle.Aerial, 'sphericalMercator': true, numZoomLevels: 20 });
			map.addLayer(bingsat)
		} else if (layer == 'yahoo') {
			var yahoosat = new OpenLayers.Layer.Yahoo("Yahoo Satellite", {type: YAHOO_MAP_SAT, sphericalMercator: true, numZoomLevels: 22});
			map.addLayer(yahoosat)
// you can try
// http://hypercube.telascience.org/tilecache/tilecache.py/1.0.0/NAIP_ALL/

// but you might get better performance from newworld which switches
// between bmng/landsat/naip based on zoom level

// http://hypercube.telascience.org/tilecache/tilecache.py/1.0.0/NewWorld_google
		} else if (layer == 'TMS') {
			Config.tile_url = tile_url || Config.tile_url
	       		var tms = new OpenLayers.Layer.TMS( "OpenLayers TMS", Config.tile_url,
				{ //projection: latlon,
		      //displayProjection: spher_merc,
				  //getURL: Knitter.overlay_getTileURL,
				  //maxResolution:156543.0339,
	    	  //units: "m",
	              //maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34),
				  //tileOrigin: new OpenLayers.LonLat(0,0).transform(latlon,spher_merc),
				  numZoomLevels: 22,
				  serviceVersion: '.', 
				  layername: '.', 
				  type: 'png', 
				  alpha: true, 
				  isBaseLayer: true});
	       		map.addLayer(tms);
		} else if (layer == 'WMS') {
			projection: latlon,
			//wms_url = prompt('Enter a WMS URI','http://msrmaps.com/ogcmap.ashx')
			Config.tile_url = tile_url || Config.tile_url
			Config.tile_layer = tile_layer || Config.tile_layer
			map.addLayer(new OpenLayers.Layer.WMS('WMS',Config.tile_url,{
			layers: Config.tile_layer
				//layers:'DOQ'
				//layers:'osm'
			}))
		}

		Glop.observe('glop:draw',function(){$('map').setStyle({height:Glop.height+'px'})})
		if (Config.tile_type == 'WMS') Glop.observe('mouseup',function() {map.layers.first().refresh()})

		// the following is complete nonsense and resolves to a point, not a bbox:
		var lat1 = Projection.y_to_lat(Map.y-Glop.height/2)
		var lon1 = Projection.x_to_lon(Map.x-Glop.width/2)
		var lat2 = Projection.y_to_lat(Map.y+Glop.height/2)
		var lon2 = Projection.x_to_lon(Map.x+Glop.width/2)

		var bounds = new OpenLayers.Bounds();
		bounds.extend(new OpenLayers.LonLat(lon1,lat1))//.transform(spher_merc,latlon))
		bounds.extend(new OpenLayers.LonLat(lon2,lat2))//.transform(spher_merc,latlon))
		//if (warpables.length = 0) 
		map.zoomToExtent( bounds )
		//console.log(lat1,lon1,lat2,lon2)
		//console.log(bounds)
		//console.log('initial extent based on viewport sync with Cartagen')

		//scalebar = new OpenLayers.Control.ScaleBar();
		//map.addControl(scalebar);
		
		if (Config.tile_switcher) {
	         	var switcherControl = new OpenLayers.Control.LayerSwitcher()
			map.addControl(switcherControl);
	    switcherControl.maximizeControl();
		}
		Knitter.openLayersDraw()
		Glop.observe('glop:draw', Knitter.openLayersDraw)
			
		Knitter.save.submitted()
		// Is this necessary if nothing has happened on the map yet?
		new Ajax.Request('/map/update/'+Knitter.map_id,{
			method: 'get',
			parameters: {
				lat: Map.lat,
				lon: Map.lon,
				zoom: Map.zoom,
				tiles: layer,
				tile_url: Config.tile_url,
				tile_layer: Config.tile_layer
			},
			onSuccess: Knitter.save.saved,
			on0: Knitter.save.failed,
			onFailure: Knitter.save.failed,
		})
	},

	openLayersDraw: function() {
		if (Config.tile_type == 'WMS') map.moveTo(new OpenLayers.LonLat(Map.lon,Map.lat))
		else map.moveTo(new OpenLayers.LonLat(Map.lon,Map.lat).transform(spher_merc,latlon))

		var left = new OpenLayers.LonLat(map.getExtent().left,map.getExtent().top);
		var right = new OpenLayers.LonLat(map.getExtent().right,map.getExtent().bottom);

		if (Config.tile_type == 'WMS') var convert = Glop.width/124023.4375
		else {
			left = left.transform(spher_merc,latlon);
			right = right.transform(spher_merc,latlon);

			var convert = 124023.4375*Glop.width
		}
		Map.zoom = convert/(right.lon-left.lon)

	},

	overlay_getTileURL: function(bounds) {
	        var res = this.map.getResolution();
	        var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	        var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
	        var z = this.map.getZoom();
		//console.log('getting tile '+z+','+x+','+y)
		if (this.map.baseLayer.name == 'Virtual Earth Roads' || this.map.baseLayer.name == 'Virtual Earth Aerial' || this.map.baseLayer.name == 'Virtual Earth Hybrid') {
	        	z = z + 1;
	        }
		if (mapBounds.intersectsBounds( bounds ) && z >= mapMinZoom && z <= mapMaxZoom ) {
	  //console.log( this.url + z + "/" + x + "/" + y + "." + this.type);
			return this.url + z + "/" + x + "/" + y + "." + this.type;
		} else {
			return "http://www.maptiler.org/img/none.png";
		}
	},

	save_new_location: function(lat,lon,zoom) {
		Knitter.save.submitted()
		new Ajax.Request('/map/update/'+Knitter.map_id,{
			method: 'get',
			parameters: {
				lat: lat,
				lon: lon,
				zoom: zoom
			},
			onSuccess: Knitter.save.saved,
			on0: Knitter.save.failed,
			onFailure: Knitter.save.failed,
		})
	},

	save_current_location: function(callback) {
		Knitter.save_new_location(Map.lat,Map.lon,Map.zoom)
		if (!Object.isUndefined(callback)) callback()
	},

	toggle_vectors: function() {
		Config.vectors = !Config.vectors
		$('tagreport').toggle()
		if (Config.vectors) $('tool_vectors').addClassName('down')
		else $('tool_vectors').removeClassName('down')
		if ($('loading_message')) $('loading_message').hide()
		Knitter.save.submitted()
		new Ajax.Request('/map/update/'+Knitter.map_id,{
			method: 'get',
			parameters: {
				lat: Map.lat,
				lon: Map.lon,
				zoom: Map.zoom,
				vectors: Config.vectors
			},
			onSuccess: Knitter.save.saved,
			on0: Knitter.save.failed,
			onFailure: Knitter.save.failed,
		})
	},

	background_transparent: true,
	toggle_background: function() {
		if (Knitter.background_transparent) {
			$('map').removeClassName('transparent');
		} else {
			$('map').addClassName('transparent');
		}
		Knitter.background_transparent = !Knitter.background_transparent
	},

	center_on_warpables: function() {
		if (warpables.length > 0) {
			var latsum = 0, lonsum = 0, latcount = 0, loncount = 0
			var maxlat = 0,maxlon = 0,minlat = 0,minlon = 0
			warpables.each(function(warpable){
				if (warpable.nodes != "none") {
					warpable.nodes.each(function(node) {
						var lon = Projection.x_to_lon(-node[0])
						var lat = Projection.y_to_lat(node[1])
						if (maxlon == 0) maxlon = lon
						if (maxlat == 0) maxlat = lat
						if (minlon == 0) minlon = lon
						if (minlat == 0) minlat = lat
						if (lon > maxlon) maxlon = lon 
						if (lat > maxlat) maxlat = lat 
						if (lon < minlon) minlon = lon 
						if (lat < minlat) minlat = lat 
   			        	lonsum += lon
   			        	latsum += lat
						loncount += 1
						latcount += 1
	    		})
				}
			},this)
			if (latcount > 0) Cartagen.go_to((maxlat+minlat)/2,(maxlon+minlon)/2,Map.zoom)
			// the "+2" is a hack... this equation would work without it if the map were only one tile wide.
			map.zoomTo(parseInt(-Math.log((maxlon-minlon)/360)/Math.log(2))+2)
		}
	},
	export_tabs: ['export_intro','export_options','export_multispectral'],
	export_hide_tabs: function() {
		Knitter.export_tabs.each(function(tab) {
			$(tab).hide();
			$(tab+'_tab').removeClassName('active');
		})
	},
	export_intro: function() {
		Knitter.export_hide_tabs();
		$('export_normal').show();
		$('export_intro').show();
		$('export_intro_tab').addClassName('active');
	},
	export_options: function() {
		Knitter.export_hide_tabs();
		$('export_normal').show();
		$('export_options').show();
		$('export_options_tab').addClassName('active');
	},
	export_multispectral: function() {
		Knitter.export_hide_tabs();
		$('export_normal').hide();
		$('export_multispectral').show();
		$('export_multispectral_tab').addClassName('active');
	},
	// for now, just used to store the "export progress" checkers, which run every 5 secs and fill up the logs.
	updaters: [],
	cancel_updaters: function() {
		Knitter.updaters.each(function(u){
			u.stop()
		})
	},
}

function osm_getTileURL(bounds) {
	var res = this.map.getResolution();
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
	var z = this.map.getZoom();
	var limit = Math.pow(2, z);
	
	if (y < 0 || y >= limit) {
	    return "http://www.maptiler.org/img/none.png";
	} else {
	    x = ((x % limit) + limit) % limit;
	    return this.url + z + "/" + x + "/" + y + "." + this.type;
	}
}

