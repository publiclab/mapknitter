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

	start_openlayers: function(layer) {
		if (!Knitter.openlayers_on) Knitter.init_openlayers(layer)
		// http://isse.cr.usgs.gov/ArcGIS/services/Combined/TNM_Large_Scale_Imagery/MapServer/WMSServer?request=GetCapabilities&service=WMS
		// http://raster.nationalmap.gov/ArcGIS/rest/services/Combined/TNM_Large_Scale_Imagery/MapServer
		// http://viewer.nationalmap.gov/example/services.html
		Config.tiles = true
		Config.tile_type = layer
		Zoom.interval = 6 
		if (layer == 'google') {
			var gsat = new OpenLayers.Layer.Google("Google Satellite", {type: G_SATELLITE_MAP, sphericalMercator: true, numZoomLevels: 20} );
			map.addLayer(gsat)
		} else if (layer == 'yahoo') {
			var yahoosat = new OpenLayers.Layer.Yahoo("Yahoo Satellite", {type: YAHOO_MAP_SAT, sphericalMercator: true, numZoomLevels: 20});
			map.addLayer(yahoosat)
		} else if (layer == 'TMS') {
			tile_url = prompt('Enter a TMS URI','http://maps.grassrootsmapping.org/chandeleur-may-9-balloon/')
	       		var tms = new OpenLayers.Layer.TMS( "OpenLayers TMS", tile_url,
				{ //projection: latlon,
		                  //displayProjection: spher_merc,
				  //getURL: Knitter.overlay_getTileURL,
				  //maxResolution:156543.0339,
	                	  //units: "m",
	                          //maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34),
				  //tileOrigin: new OpenLayers.LonLat(0,0).transform(latlon,spher_merc),
				  serviceVersion: '.', 
				  layername: '.', 
				  type: 'png', 
				  alpha: true, 
				  isBaseLayer: true});
	       		map.addLayer(tms);
		} else if (layer == 'WMS') {
			projection: latlon,
			//wms_url = prompt('Enter a WMS URI','http://msrmaps.com/ogcmap.ashx')
			wms_url = prompt('Enter a WMS URI','http://isse.cr.usgs.gov/arcgis/services/Combined/SDDS_Imagery/MapServer/WMSServer?SERVICE=WMS&VERSION=1.1.1&STYLES=&SRS=EPSG:4326&FORMAT=image/png&layers=0&request=map&')
			wms_layer = prompt('Enter a WMS layer','0')
			map.addLayer(new OpenLayers.Layer.WMS('WMS',wms_url,{
			layers: wms_layer
				//layers:'DOQ'
				//layers:'osm'
			}))
		}

		Glop.observe('glop:draw',function(){$('map').setStyle({height:Glop.height+'px'})})
		if (Config.tile_type == 'WMS') Glop.observe('mouseup',function() {map.layers.first().refresh()})

		var lat1 = Projection.y_to_lat(Map.y-Glop.height/2)
		var lon1 = Projection.x_to_lon(Map.x-Glop.width/2)
		var lat2 = Projection.y_to_lat(Map.y+Glop.height/2)
		var lon2 = Projection.x_to_lon(Map.x+Glop.width/2)

		var bounds = new OpenLayers.Bounds();
		bounds.extend(new OpenLayers.LonLat(lon1,lat1))//.transform(spher_merc,latlon))
		bounds.extend(new OpenLayers.LonLat(lon2,lat2))//.transform(spher_merc,latlon))

		map.zoomToExtent( bounds )
		if (Config.tile_switcher) {
	         	var switcherControl = new OpenLayers.Control.LayerSwitcher()
			map.addControl(switcherControl);
	                switcherControl.maximizeControl();
		}
		Knitter.openLayersDraw()
		Glop.observe('glop:draw', Knitter.openLayersDraw)
			
		Knitter.save.submitted()
		new Ajax.Request('/map/update/'+Knitter.map_id,{
			method: 'get',
			parameters: {
				lat: Map.lat,
				lon: Map.lon,
				zoom: Map.zoom,
				tiles: layer // here we might add a WMS url too
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
		Config.vectors = !Config.vectors;
		$('tagreport').toggle()
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

	center_on_warpables: function() {
		if (warpables.length > 0) {
			var latsum = 0, lonsum = 0, latcount = 0, loncount = 0
			warpables.each(function(warpable){
				if (warpable.nodes != "none") {
					warpable.nodes.each(function(node) {
               			        	lonsum += Projection.x_to_lon(-node[0])
               			        	latsum += Projection.y_to_lat(node[1])
						loncount += 1
						latcount += 1
	                		})
				}
			},this)
			Cartagen.go_to(latsum/latcount,lonsum/loncount,Map.zoom)
		}
	}
}
