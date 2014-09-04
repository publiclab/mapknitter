(function(window, document, undefined) {

"use strict";

window.MapKnitter = {};

/* 
 * MapKnitter.Class: A bare-bones version of Leaflet's Class feature, 
 * for simple classical inheritance. 
 * See https://github.com/Leaflet/Leaflet/blob/master/src/core/Class.js.
 */

MapKnitter.Class = function() {};
MapKnitter.Class.extend = function(obj) {
	var NewClass = function() {
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}
	};

	var F = function() {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	L.extend(proto, obj);

	var parent = this;
	NewClass.__super__ = parent.prototype;

	return NewClass;
};
MapKnitter.Class.include = function(obj) {
	L.extend(this.prototype, obj);
};
MapKnitter.Resources = MapKnitter.Class.extend({

	supported: [ 'Annotation' ],

	/* Change this as necessary for development: e.g. to http://localhost:3000 */
	baseUrl: '',

	initialize: function(options) {
		this._map_id = options.map_id;

		this._mapUrl = this.baseUrl + '/maps/' + this._map_id + '/';
		this._resourcesUrl = this._mapUrl + this._name + 's/';
	},

	retrieve: function(id, callback) {
		this._retrieveResources(id, callback)
			.done.call(this, function() {
				console.log('retrieved resources');
			});
	},

	create: function(annotation) {
		this._createResource(annotation, newResource)
			.done.call(this, function() {
				console.log('created new resource');
				console.log(newResource);
			});
	},

	update: function() {	
		// PUT to /maps/:map_id/:resources/:id
	},

	delete: function() {

	},

	_retrieveResources: function(id, callback) {
		/* 
		 * With the optional id argument, _retrieveResources gets a single resource, if it exists. 
		 * Without the optional id argument, _retrieveResources gets all resources.
		 */

		var url;

		if (!callback && typeof id === 'function') {
			callback = id;
			id = undefined;
		}

		url = id ? this._resourcesUrl + id : this._resourcesUrl;

		return jQuery.ajax({
			url: url,
			dataType: 'json',
			context: this,
			success: function(data) { callback(data); },
			error: function(jqXHR, status, thrownError) { console.log(thrownError);	}
		});
	},

	_createResource: function(resource, dest) {
		/* POST to /maps/<%= this._map_id %>/<%= this._name %> */
		var data 	= {},
			token 	= $("meta[name='csrf-token']").attr("content");

		data[this._name] = this.toJSON(resource);

		return jQuery.ajax({
			url: 			this._resourcesUrl,
			data: 			JSON.stringify(data),
			contentType: 	'application/json',
			type: 			'POST',
			beforeSend: 	function(xhr) {
				/* Need to pass the csrf token in order to maintain the user session. */
				xhr.setRequestHeader('X-CSRF-Token', token);
				// xhr.setRequestHeader('Content-Type', 'application/json');
			},
			success: 		function(data) { dest = data; },
			error: 			function(jqXHR, status, thrownError) { console.log(thrownError); }
		});
	}

});

/* Automatically define classes extending MapKnitter.Resources for all supported resources types. */
(function() {
	for (var i = 0; i < MapKnitter.Resources.prototype.supported.length; i++) {
		var resource = MapKnitter.Resources.prototype.supported[i];

		MapKnitter[resource + 's'] = MapKnitter.Resources.extend({
			_name: resource.toLowerCase()
		});	
	}
})();
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
			new L.GeoJSON(annotations).addTo(map);
		});
	},

	_initEvents: function() {
		var map = this._map;

		map.on('draw:created', function(event) {
			var layer = event.layer;

			/* Display annotation on the map. */
			this._drawnItems.addLayer(layer);

			/* Create new database record via AJAX request; see MapKnitter.Resources#create. */
			this.create(layer);
		}, this);

		map.on('draw:edit', function() {

		});
	},

	toJSON: function(annotation) {
		var json = {
			type: 			annotation.type,
			coordinates: 	this._getGeoJSONCoordinates(annotation),
			text: 			this._getContent(annotation),
		};

		/* If the annotation already exists in the database. */
		if (annotation._mapknitter_id) {
			json.id = annotation._mapknitter_id;
		}

		return json;
	},

	_getGeoJSONCoordinates: function(annotation) {
		var coordinates = [],
			latlngs,
			coord;

		if (annotation.getLatLng) {
			coord = annotation.getLatLng();
			coordinates = [coord.lng, coord.lat];
		} else if (annotation.getLatLngs) {
			latlngs = annotation.getLatLngs();
			for (var i = 0; i < latlngs.length; i++) {
				coord = latlngs[i];
				coordinates.push([coord.lng, coord.lat]);
			}			
		}			

		return coordinates;
	},

	_getContent: function(annotation) {
		var content = '';

		if (annotation.getContent) {
			content = annotation.getContent();
		}

		return content;
	}

});
MapKnitter.Map = MapKnitter.Class.extend({

	initialize: function(options) {
		this._zoom = options.zoom || 0;
		this._latlng = L.latLng(options.latlng);

		this._map = L.map('knitter-map-pane', { zoomControl: false })
			.setView(this._latlng, this._zoom);

		/* Set up basemap and drawing toolbars. */
		this.setupMap();

		/* Load warpables data via AJAX request. */
		// this._warpablesUrl = options.warpablesUrl;
		// this.withWarpables();

		/* Enable users to drag images from the sidebar onto the map. */
		this.enableDragAndDrop();
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

	withWarpable: function(id, size, callback) {
		this.withWarpables(function(warpables) {
			var url = warpables[id][size],
				img = jQuery("<img/>").attr("src", url).attr("data-warpable-id", id);
			callback(img);
		});
	},

	setupMap: function() {
		var map = this._map;

		L.control.zoom({ position: 'topright' }).addTo(map);
		L.tileLayer.provider('Esri.WorldImagery').addTo(map);
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
	},

	addMetadata: function() {

	}
});

}(window, document));