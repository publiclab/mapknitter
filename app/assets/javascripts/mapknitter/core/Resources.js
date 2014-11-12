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

	create: function(annotation, callback) {
		this._createResource(annotation, callback)
			.done.call(this, function() {
				console.log('created new resource');
			});
	},

	update: function(resource, callback) {	
		// PUT to /maps/:map_id/:resources/:id
		this._updateResource(resource, callback);
	},

	deleteResource: function(resource, callback) {
		this._deleteResource(resource, callback);
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
			success: function(data) { 
				if (callback && typeof callback === 'function' ) { 
					callback.call(this, data); 
				} 
			},
			error: function(jqXHR, status, thrownError) { console.log(thrownError);	}
		});
	},

	_createResource: function(resource, callback) {
		var options = this._postDefaults(resource, 'POST', callback);

		return jQuery.ajax(options);
	},

	_updateResource: function(resource, callback) {
		var options = this._postDefaults(resource, 'PUT', callback);

		options.url = this._resourcesUrl + this.stampResource(resource);

		return jQuery.ajax(options);
	},

	_deleteResource: function(resource, callback) {
		var options = this._postDefaults(resource, 'DELETE', callback);

		options.url = this._resourcesUrl + this.stampResource(resource);

		return jQuery.ajax(options);
	},

	_postDefaults: function(resource, action, callback) {
		var data = {},
			token = jQuery("meta[name='csrf-token']").attr("content");

		data[this._name] = this.toJSON(resource);
		data._method = action;

		return {
			url: 			this._resourcesUrl,
			data: 			JSON.stringify(data),
			contentType: 	'application/json',
			type: 			action,
			context: this,
			beforeSend: function(xhr) {
				xhr.setRequestHeader('X-CSRF-Token', token);

				/* Hack to get around an issue in Rails 2.3: https://github.com/rails/rails/issues/612 */
				if (action !== 'POST') {
					xhr.setRequestHeader('X-HTTP-Method-Override', action);
				}
			},
			success: function(data) {
				if (callback && typeof callback === 'function') {
					callback.call(this, data); 
				}
			},
			error: function(jqXHR, status, thrownError) { console.log(thrownError); }
		};	
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