var MapKnitter = L.Class.extend({

	initialize: function(options) {
		this._zoom = options.zoom || 0;
		this._latlng = L.latLng(options.latlng);

		this._map = L.map('knitter-map-pane', { zoomControl: false })
			.setView(this._latlng, this._zoom);

		this._warpablesUrl = options.warpablesUrl;

		/* Set up basemap and drawing toolbars. */
		this.setupMap();

		/* Load warpables data via AJAX request. */
		this.withWarpables();

		/* Enable users to drag images from the sidebar onto the map. */
		this.enableDragAndDrop();
	},

	placeImage: function(event, ui) {
		var that = this,
			$img = jQuery(ui.helper),
			url = $img.attr("src"),
			id = $img.attr("data-warpable-id"),
			imgPosition = $img.offset();
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

	withWarpables: function(callback) {
		if (this._warpables) {
			if (callback) { callback(this._warpables); };
		} else {
			jQuery.getJSON(this._warpablesUrl, function(warpablesData) {
				this._warpables = warpablesData;
				if (callback) { callback(this._warpables); };
			});	
		}
	},

	withWarpable: function(id, size, callback) {
		this.withWarpables(function(warpables) {
			var url = warpables[id][size],
				img = jQuery("<img/>").attr("src", url).attr("data-warpable-id", id);
			callback(img);
		});
	},

	setupMap: function() {
		var drawnItems = new L.FeatureGroup().addTo(this._map),
			zoomControl = L.control.zoom({ position: 'topright' }).addTo(this._map),
			illustrateControl = new L.Illustrate.Control({
				position: 'topright',
				edit: { featureGroup: drawnItems }
			}).addTo(this._map),
			drawControl = new L.Control.Draw({
				position: 'topright',
				edit: { featureGroup: drawnItems }
			}).addTo(this._map);

		L.tileLayer.provider('Esri.WorldImagery').addTo(this._map);
	},

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
	}
});

