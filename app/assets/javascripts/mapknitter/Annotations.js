MapKnitter.Annotations.include({

	initialize: function(options) {
		MapKnitter.Resources.prototype.initialize.call(this, options);

		var map = options.map;

		this._map = map;
		this._drawnItems = new L.FeatureGroup().addTo(map);

		new L.Illustrate.Control({
			position: 'topright',
			edit: { featureGroup: this._drawnItems }
		}).addTo(map);

		new L.Control.Draw({
			position: 'topright',
			edit: { featureGroup: this._drawnItems }
		}).addTo(map);

		this._initEvents();

		/* Get annotations for this map. */
		this.retrieve(function(annotations) {
			new L.GeoJSON(annotations, { 
				pointToLayer: this._pointToLayer.bind(this),
				onEachFeature: function(geojson, layer) {
					this._onAnnotationAdd(layer);
					this.stampResource(layer, geojson.properties.id);					
				}.bind(this)
			});
		});
	},

	_initEvents: function() {
		var map = this._map;

		map.on('draw:created', function(event) {
			var layer = event.layer;

			layer.type = event.layerType;

			/* Display annotation on the map. */
			this._onAnnotationAdd(layer);

			/* Create new database record via AJAX request; see MapKnitter.Resources#create. */
			this.create(layer, function(geojsonResponse) {
				this.stampResource(layer, geojsonResponse.properties.id);
			});
		}, this);

		map.on('draw:edited', function(event) {
			var layers = event.layers;

			/* Update each record via AJAX request; see MapKnitter.Resources#update. */
			layers.eachLayer(function(layer) {
				this.update(layer, function(data) { console.log(data); });
			}, this);
		}, this);

		map.on('draw:deleted', function(event) {
			var layers = event.layers;

			/* Delete each record via AJAX request; see MapKnitter.Resources#delete. */
			layers.eachLayer(function(layer) {
				this.deleteResource(layer, function(data) { console.log(data); });
			}, this);
		}, this);
	},

	_onAnnotationAdd: function(annotation) {
		this._drawnItems.addLayer(annotation);

		switch (annotation.type) {
			case 'textbox':
				/* Focus on the textarea. */
				annotation.getTextarea().focus();

				/* Need to listen for text edits on textboxes */
				annotation.on('textedit', function() {
					if (annotation.editing.enabled()) {
						annotation.edited = true;
					} else {
						this.update(annotation, function(data) { console.log(data); });				
					}
				}, this);
				break;
		}
	},

	toJSON: function(annotation) {
		var geojson = annotation.toGeoJSON();

		geojson.properties.annotation_type = annotation.type;

		return geojson;
	},

	_pointToLayer: function(geojson, latlng) {
		var size = new L.Point(geojson.properties.style.width, geojson.properties.style.height),
			textbox = new L.Illustrate.Textbox(latlng, {
				textContent: geojson.properties.textContent,
				size: size,
				rotation: geojson.properties.style.rotation
			});

		return textbox;
	},

	stampResource: function(annotation, id) {
		var mapknitter_id;

		/* If called with an id argument, sets the _mapknitter_id and returns it. */
		/* If called without an id argument, returns the _mapknitter_id. */
		if (id) {
			annotation._mapknitter_id = id;
			mapknitter_id = id;
		} else {
			mapknitter_id = annotation._mapknitter_id;
		}

		return mapknitter_id;
	}

});