MapKnitter.Annotations.include({

  initialize: function(options) {
    MapKnitter.Resources.prototype.initialize.call(this, options);

    var map = options.map
      drawOptions = {};

    this._map = map;
    this._drawnItems = new L.FeatureGroup().addTo(map);

    /* Read in styles from MapKnitter.Annotations.style */
    for (var annotationType in MapKnitter.Annotations.style) {
      if (MapKnitter.Annotations.style.hasOwnProperty(annotationType)) {
        drawOptions[annotationType] = {
          shapeOptions: MapKnitter.Annotations.style[annotationType]
        }
      }
    }

    new MapKnitter.Annotations.Toolbar({
      position: 'topright',
      edit: { featureGroup: this._drawnItems },
      draw: drawOptions
    }).addTo(map);

    this._initEvents();

    /* Get annotations for this map from the database. */
    this.retrieve(function(annotations) {
      new L.GeoJSON(annotations, { 
        pointToLayer: this._pointToLayer.bind(this),
        onEachFeature: function(geojson, layer) {
          layer.type = geojson.properties.annotation_type;
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

      if (layer.type === 'textbox') {
        /* Focus on the textarea. */
        layer.getTextarea().focus();        
      }

      if (window.mapknitter.logged_in || window.mapknitter.anonymous) {

        /* Create new database record via AJAX request; see MapKnitter.Resources#create. */
        this.create(layer, function(geojsonResponse) {
          this.stampResource(layer, geojsonResponse.properties.id);
        });

      } else {
        alert('You must be logged in to save annotations on this map.')
      }
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
    this._setStyle(annotation);

    switch (annotation.type) {
      case 'textbox':
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

    if (!geojson.properties.style) {
      geojson.properties.style = {};
    }

    /* Add annotation type and style. */
    L.extend(geojson.properties, { annotation_type: annotation.type });

    switch (annotation.type) {
      case 'circle':
        geojson.properties.style.radius = annotation.getRadius();
        break;
    }

    return geojson;
  },

  _pointToLayer: function(geojson, latlng) {
    var width, height, annotation;

    switch(geojson.properties.annotation_type) {
      case 'textbox':
        width = geojson.properties.style.width;
        height = geojson.properties.style.height;
        annotation = new L.Illustrate.Textbox(latlng, {
          textContent: geojson.properties.textContent,
          size: new L.Point(width, height),
          rotation: geojson.properties.style.rotation
        });
        break;
      case 'circle':
        annotation = new L.Circle(latlng, geojson.properties.style.radius);
        break;
      default:
        annotation = new L.Marker(latlng);
    }

    return annotation;
  },

  _setStyle: function(annotation) {
    if (annotation.setStyle) {
      annotation.setStyle(MapKnitter.Annotations.style[annotation.type]);
    }
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
