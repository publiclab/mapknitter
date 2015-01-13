MapKnitter.Map = MapKnitter.Class.extend({

	initialize: function(options) {
		this._zoom = options.zoom || 0;
		this._latlng = L.latLng(options.latlng);

    /* Initialize before map in order to add to layers; probably it can be done later too */
    var google = new L.Google("SATELLITE",{
      maxZoom: 24,
      opacity:0.5
    });

		this._map = L.map('knitter-map-pane', { 
      zoomControl: false,
      layers: [google]
    }).setView(this._latlng, this._zoom);

    // deprecate this; we should not need global map var
    map = this._map

    /* Startup the Leaflet.DistortableImage plugin; will change in >v0.0.5 of the plugin */
    $L.initialize({img_dir: '/lib/leaflet-distortableimage/src/images/'})

		/* Set up basemap and drawing toolbars. */
		this.setupMap();

		/* Load warpables data via AJAX request. */
		this._warpablesUrl = options.warpablesUrl;
		this.withWarpables(function(warpables){
      $.each(warpables,function(i,warpable) {
        if (warpable.nodes.length > 0) {
          img = new L.DistortableImageOverlay(
            warpable.src_medium,
            { 
              latlng:  [ 
                new L.latLng(warpable.nodes[0].lat,
                             warpable.nodes[0].lon),
                new L.latLng(warpable.nodes[1].lat,
                             warpable.nodes[1].lon),
                new L.latLng(warpable.nodes[3].lat,
                             warpable.nodes[3].lon),
                new L.latLng(warpable.nodes[2].lat,
                             warpable.nodes[2].lon)
                       ],
              locked: warpable.locked
          });

          // this is being run on *all* images each deselect
          // but it is going to be deprecated on move to v0.0.5+
          // so maybe who cares
          img.onDeselect = function() {
            console.log('saving')
            $.ajax('/images/update',{
              type: 'POST',
              data: {
                warpable_id: warpable.id,
                locked: this.locked,
                points: 
                  this.markers[0]._latlng.lng+','+this.markers[0]._latlng.lat+':'+
                  this.markers[1]._latlng.lng+','+this.markers[1]._latlng.lat+':'+
                  this.markers[3]._latlng.lng+','+this.markers[3]._latlng.lat+':'+
                  this.markers[2]._latlng.lng+','+this.markers[2]._latlng.lat,
              },
              beforeSend: function(e) {
                $('.mk-save').removeClass('fa-check-circle fa-times-circle fa-green fa-red').addClass('fa-spinner fa-spin')
              },
              complete: function(e) {
                $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-check-circle fa-green')
              },
              error: function(e) {
                $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-times-circle fa-red')
              }
            })
          }
        }
      });
    });


    $L.saveBtn = L.easyButton('fa-check-circle fa-green mk-save', 
      function() {},
      'Save status',
      map,
      this
    ) 
 
    $L.highResBtn = L.easyButton('fa-delicious', 
      $L.highres = function() {
        $.each($L.images,function(i,img) {
          img._image.src = img._image.src.split('_medium').join('')
        })
        $L.highResBtn._container.remove()
      },
      'Switch to high-res imagery',
      map,
      this
    ) 

		/* Enable users to drag images from the sidebar onto the map. */
		//this.enableDragAndDrop();
	},

	getMap: function() {
		return this._map;
	},

	placeImage: function(event, ui) {
		var that = this,
			$img = jQuery(ui.helper),
			url = $img.attr("src"),
			id = $img.attr("data-warpable-id"),
			imgPosition = $img.offset(),
			upperLeft = L.point(imgPosition.left, imgPosition.top),
			size = L.point($img.width(), $img.height()),
			lowerRight = upperLeft.add(size);

		/* Place low-resolution image on the map. */
		var lowres = L.imageOverlay(url, [
			this._map.containerPointToLatLng(upperLeft), 
			this._map.containerPointToLatLng(lowerRight)
		]).addTo(this._map);

		/* Load the high-resolution version on top of the low-res version. */
		this.withWarpable(id, "original", function(img) {
			var url = jQuery(img).attr("src");
			L.imageOverlay(url, [
				that._map.containerPointToLatLng(upperLeft), 
				that._map.containerPointToLatLng(lowerRight)
			]).addTo(that._map);
			that._map.removeLayer(lowres);
		});
	},

  /* Fetch JSON list of warpable images */
	withWarpables: function(callback) {
		if (this._warpables) {
			if (callback) { callback(this._warpables); }
		} else {
			jQuery.getJSON(this._warpablesUrl, function(warpablesData) {
				this._warpables = warpablesData;
				if (callback) { callback(this._warpables); }
			});	
		}
	},

  /* withWarpable(id, "medium", function(img) { ... }) */
	withWarpable: function(id, size, callback) {
		this.withWarpables(function(warpables) {
			var url = warpables[id][size],
				img = jQuery("<img/>").attr("src", url).attr("data-warpable-id", id);
			callback(img);
		});
	},

	setupMap: function() {
		var map = this._map;

		//L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    var mapbox = L.tileLayer('https://{s}.tiles.mapbox.com/v3/anishshah101.ipm9j6em/{z}/{x}/{y}.png', {
      maxZoom: 24,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'examples.map-i86knfo3'
    })

    //map.fitBounds(map._layers[1]._bounds)

    var baseMaps = {
        "OpenStreetMap": mapbox,
        "Google Satellite": google
    };
    // eventually, annotations
    var overlayMaps = {
    };
   
    var layersControl = new L.Control.Layers(baseMaps,overlayMaps);
    map.addControl(layersControl);

		L.control.zoom({ position: 'topright' }).addTo(map);
	},

  /* will be deprecated or integrated with Leaflet.DistortableImage code */
	enableDragAndDrop: function() {
		var that = this;

		jQuery("#knitter-map-pane")
			.droppable({ drop: this.placeImage.bind(this) });

		var $selection = jQuery(".warpables-all tr img");

		$selection.draggable({ revert: "invalid" });

		$selection.each(function(index, warpable) {
			var id = jQuery(warpable).attr("data-warpable-id");
			that.withWarpable(id, "medium", function(img) {
				jQuery(warpable).draggable("option", "helper", function() { return img; });
			});
		});
	},

	addMetadata: function() {

	}
});
