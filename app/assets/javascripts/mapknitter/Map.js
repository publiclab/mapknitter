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

    saveBtn = L.easyButton('fa-check-circle fa-green mk-save', 
    function() {},
      'Save status',
      map,
      this
    )

    images = []
    select = function(e){
      for (var i in images) {
        img = this
        if (img._leaflet_id != images[i]._leaflet_id) {
          /* Deselect (disable) other images */
          images[i].editing.disable()
          /* Ensure that other toolbars are removed */
          if (images[i].editing.toolbar) {
            map.removeLayer(images[i].editing.toolbar);
          }
        }
      }
      /* Ensure this is enabled */
      this.editing.enable()
      this.bringToFront()
      /* If it's locked, allow event to propagate on to map below */
      if (this.editing._mode != "lock") e.stopPropagation()
    }

		/* Set up basemap and drawing toolbars. */
		this.setupMap();

		/* Load warpables data via AJAX request. */
		this._warpablesUrl = options.warpablesUrl;
		this.withWarpables(function(warpables){
      $.each(warpables,function(i,warpable) {
        // only already-placed images:
        if (warpable.nodes.length > 0) {

          var img = new L.DistortableImageOverlay(
            warpable.srcmedium,
            { 
              corners:  [ 
                new L.latLng(warpable.nodes[0].lat,
                             warpable.nodes[0].lon),
                new L.latLng(warpable.nodes[1].lat,
                             warpable.nodes[1].lon),
                new L.latLng(warpable.nodes[3].lat,
                             warpable.nodes[3].lon),
                new L.latLng(warpable.nodes[2].lat,
                             warpable.nodes[2].lon)
                       ],
              mode: 'lock'
          }).addTo(map);
          images.push(img);

          // refactor to use on/fire; this doesn't seem to work: 
          // img.on('select', function(e){
          L.DomEvent.on(img._image, 'mousedown', select, img);

          img.on('deselect', function() {
            if (this.editing._mode != 'lock') {
              console.log('saving')
              $.ajax('/images/update',{
                type: 'POST',
                data: {
                  warpable_id: warpable.id,
                  locked: (this.editing._mode == 'lock'),
                  points: 
                    this._corners[0].lng+','+this._corners[0].lat+':'+
                    this._corners[1].lng+','+this._corners[1].lat+':'+
                    this._corners[3].lng+','+this._corners[3].lat+':'+
                    this._corners[2].lng+','+this._corners[2].lat,
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
          })
        }
      });
    });

    /* Deselect images if you click on the sidebar, 
     * otherwise hotkeys still fire as you type. */
    $('.sidebar').click(function(){ $.each(images,function(i,img){ img.editing.disable() }) })

    // hi res:
    //img._image.src = img._image.src.split('_medium').join('')

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
