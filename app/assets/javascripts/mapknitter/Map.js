MapKnitter.Map = MapKnitter.Class.extend({

  initialize: function(options) {
    this._zoom = options.zoom || 0;
    this._latlng = L.latLng(options.latlng);
    this.logged_in = options.logged_in;
    this.anonymous = options.anonymous;

    L.Icon.Default.imagePath = '/assets/leaflet/dist/images/';

    /* Initialize before map in order to add to layers; probably it can be done later too */
    var google = new L.Google("SATELLITE",{
      maxZoom: 24,
      maxNativeZoom: 20,
      opacity:0.5
    });

    this._map = new L.map('knitter-map-pane', { 
      zoomControl: false,
    }).setView(this._latlng, this._zoom);

    // make globally accessible map namespace for knitter.js
    map = this._map

    if (!options.readOnly) {
      saveBtn = L.easyButton('fa-check-circle fa-green mk-save', 
      function() {},
        'Save status',
        this._map,
        this
      )
    }

    images = [], bounds = [];

    /* Set up basemap and drawing toolbars. */
    this.setupMap();

    /* Load warpables data via AJAX request. */
    this._warpablesUrl = options.warpablesUrl;
    this.withWarpables(function(warpables){
      $.each(warpables,function(i,warpable) {
        // only already-placed images:
        if (warpable.nodes.length > 0) {

          var downloadEl = $('.img-download-' + warpable.id),
              imgEl = $('#full-img-' + warpable.id);

          downloadEl.click(function() { 

            downloadEl.html("<i class='fa fa-circle-o-notch fa-spin'></i>");

            imgEl[0].onload = function() {

              var height = imgEl.height(),
                  width  = imgEl.width(),
                  nw = map.latLngToContainerPoint(warpable.nodes[0]),
                  ne = map.latLngToContainerPoint(warpable.nodes[1]),
                  se = map.latLngToContainerPoint(warpable.nodes[2]),
                  sw = map.latLngToContainerPoint(warpable.nodes[3]),
                  offsetX = nw.x,
                  offsetY = nw.y,
                  displayedWidth = $('#warpable-img-' + warpable.id).width(),
                  ratio   = width / displayedWidth;

              nw.x -= offsetX;
              ne.x -= offsetX;
              se.x -= offsetX;
              sw.x -= offsetX;
 
              nw.y -= offsetY;
              ne.y -= offsetY;
              se.y -= offsetY;
              sw.y -= offsetY;
 
              warpWebGl(
                'full-img-' + warpable.id, 
                [ 0, 0,        width, 0,    width, height, 0, height ], 
                [ nw.x, nw.y,  ne.x,  ne.y, se.x,  se.y,   sw.x, sw.y ],
                true // trigger download
              ) 

              downloadEl.html("<i class='fa fa-download'></i>");

            }

            imgEl[0].src = $('.img-download-' + warpable.id).attr('data-image');

          });

          var corners = [ 
                new L.latLng(warpable.nodes[0].lat,
                             warpable.nodes[0].lon),
                new L.latLng(warpable.nodes[1].lat,
                             warpable.nodes[1].lon),
                new L.latLng(warpable.nodes[3].lat,
                             warpable.nodes[3].lon),
                new L.latLng(warpable.nodes[2].lat,
                             warpable.nodes[2].lon)
          ];

          var img = new L.DistortableImageOverlay(
            warpable.srcmedium,
            { 
              corners: corners,
              mode: 'lock'
          }).addTo(window.mapKnitter._map);

          bounds = bounds.concat(corners);
          window.mapKnitter._map.fitBounds(bounds);
          images.push(img);
          img.warpable_id = warpable.id

          if (!options.readOnly) {
            // img.on('select', function(e){
            // refactor to use on/fire; but it doesn't seem to work
            // without doing it like this: 
            L.DomEvent.on(img._image, 'click', window.mapKnitter.selectImage, img);
            img.on('deselect', window.mapKnitter.saveImageIfChanged, img)
            L.DomEvent.on(img._image, 'dblclick', window.mapKnitter.dblClickImage, img);
            L.DomEvent.on(img._image, 'load', function() {
              var img = this
              window.mapKnitter.setupToolbar(img)
            }, img);
          }
        }
      });

    });

    /* Deselect images if you click on the sidebar, 
     * otherwise hotkeys still fire as you type. */
    $('.sidebar').click(function(){ $.each(images,function(i,img){ img.editing.disable() }) })
    /* Deselect images if you click on the map. */
    //this._map.on('click',function(){ $.each(images,function(i,img){ img.editing.disable() }) })

    // hi res:
    //img._image.src = img._image.src.split('_medium').join('')
  },

  /* 
   * Setup toolbar and events
   */
  setupToolbar: function(img) {
    img.on('edit', window.mapKnitter.saveImageIfChanged, img);
    img.on('delete', window.mapKnitter.deleteImage, img)

    // Override default delete to add a confirm()
    img.on('toolbar:created', 
      function() {
        this.editing.toolbar.options.actions[1].prototype.addHooks = function() {
            var map = this._map;
            this._overlay.fire('delete');
         }
     }, img)

    L.DomEvent.on(img._image, 'mouseup', window.mapKnitter.saveImageIfChanged, img);
    L.DomEvent.on(img._image, 'touchend', window.mapKnitter.saveImageIfChanged, img);
  },

  /* Add a new, unplaced, but already uploaded image to the map.
   * <lat> and <lng> are optional. */
  addImage: function(url,id,lat,lng,angle,altitude) {
    var img = new L.DistortableImageOverlay(url);
    img.geocoding = { lat:      lat,
                      lng:      lng,
                      altitude: altitude, 
                      angle:    angle};
    images.push(img);
    img.warpable_id = id
    img.addTo(map);
    L.DomEvent.on(img._image, 'click', window.mapKnitter.selectImage, img);
    img.on('deselect', window.mapKnitter.saveImageIfChanged, img)
    L.DomEvent.on(img._image, 'dblclick', window.mapKnitter.dblClickImage, img);
    L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing);
    L.DomEvent.on(img._image, 'load', function() {
      var img = this
      window.mapKnitter.setupToolbar(img)

      /* use geodata */
      if (img.geocoding && img.geocoding.lat) {
        /* move the image to this newly discovered location */
        var center = L.latLngBounds(img._corners).getCenter(),
          latBy = img.geocoding.lat-center.lat,
          lngBy = img.geocoding.lng-center.lng
     
        for (var i=0;i<4;i++) {
          img._corners[i].lat += latBy;
          img._corners[i].lng += lngBy;
        }

        img.editing._rotateBy(img.geocoding.angle);
        
        /* Attempt to convert altitude to scale factor based on Leaflet zoom;
         * for correction based on altitude we need the original dimensions of the image. 
         * This may work only at sea level unless we factor in ground level. 
         * We may also need to get camera field of view to get this even closer.
         * We could also fall back to the scale of the last-placed image.
         */
        if (img.geocoding.altitude && img.geocoding.altitude != 0) { 
          var width = img._image.width, height = img._image.height
          //scale = ( (act_height/img_height) * (act_width/img_width) ) / img.geocoding.altitude;           
          //img.editing._scaleBy(scale);

          var elevator = new google.maps.ElevationService(), 
              lat = mapKnitter._map.getCenter().lat, 
              lng = mapKnitter._map.getCenter().lng;
    
          elevator.getElevationForLocations({'locations':[ {lat: lat, lng: lng} ]
            },function(results, status) { 
              console.log("Photo taken from " + img.geocoding.altitude + " meters above sea level"); 
              console.log("Ground is " + results[0].elevation + " meters above sea level"); 
              console.log("Photo taken from " + (img.geocoding.altitude-results[0].elevation) + " meters"); 
              var a = img.geocoding.altitude-results[0].elevation,
                  fov = 50,
                  A = fov * (Math.PI/180),
                  width = 2 * (a / Math.tan(A))
                  currentWidth = (img._corners[2].distanceTo(img._corners[1]) + 
                                  img._corners[1].distanceTo(img._corners[2])) / 2
              
              console.log("Photo should be " + width + " meters wide"); 
              img.editing._scaleBy(width/currentWidth);
              img.fire('update');

            }
          )
        }

        img.fire('update');
     
        /* pan the map there too */
        window.mapKnitter._map.fitBounds(L.latLngBounds(img._corners));

        img._reset();
      }
    }, img);
    return img;
  },

  geocodeImageFromId: function(dom_id,id,url) {
    window.mapKnitter.geocodeImage(
      $(dom_id)[0],
      function(lat,lng,id,angle,altitude) {
        /* Display button to place this image with GPS tags. */
        $('.add-image-gps-'+id).attr('data-lat',lat);
        $('.add-image-gps-'+id).attr('data-lng',lng);
        if (angle) $('.add-image-gps-'+id).attr('data-angle',angle);
        if (altitude) $('.add-image-gps-'+id).attr('data-altitude',altitude);
        $('.add-image-gps-'+id).show();
        $('.add-image-gps-'+id).on('click',function() {
          $('.add-image-'+id).hide();
          $('#uploadModal').modal('hide');
          window.mapKnitter._map.setZoom(18);
          window.mapKnitter._map.setView(
            [$(this).attr('data-lat'),
             $(this).attr('data-lng')]);
          var angle = $(this).attr('data-angle') || 0;
          var altitude = $(this).attr('data-altitude') || 0;
          img = window.mapKnitter.addImage(url,
                                     id,
                                     $(this).attr('data-lat'),
                                     $(this).attr('data-lng'),
                                     angle,
                                     altitude);
          $('#warpable-'+id+' a').hide();
        })
      },
      id
    )
  },

  /*
   * Accepts an image element, and executes given function with 
   * params as: function(lat,lng) {}
   * Adapting from: 
    https://github.com/publiclab/mapknitter/blob/6e88c7725d3c013f402526289e806b8be4fcc23c/public/cartagen/cartagen.js#L9378
  */
  geocodeImage: function(img,fn,id) {
    EXIF.getData(img, function() {
      var GPS = EXIF.getAllTags(img)
 
      /* If the lat/lng is available. */
      if (typeof GPS["GPSLatitude"] !== 'undefined' && typeof GPS["GPSLongitude"] !== 'undefined'){

        // sadly, encoded in [degrees,minutes,seconds] 
        var lat = (GPS["GPSLatitude"][0]) + 
                  (GPS["GPSLatitude"][1]/60) + 
                  (GPS["GPSLatitude"][2]/3600);
        var lng = (GPS["GPSLongitude"][0]) + 
                  (GPS["GPSLongitude"][1]/60) + 
                  (GPS["GPSLongitude"][2]/3600);

        if (GPS["GPSLatitudeRef"] != "N")  lat = lat*-1
        if (GPS["GPSLongitudeRef"] == "W") lng = lng*-1
      }

      // Attempt to use GPS compass heading; will require 
      // some trig to calc corner points, which you can find below:

      var angle = 0; 
      // "T" refers to "True north", so -90.
      if (GPS["GPSImgDirectionRef"] == "T")
        angle = (Math.PI / 180) * (GPS.GPSImgDirection["numerator"]/GPS.GPSImgDirection["denominator"] - 90);
      // "M" refers to "Magnetic north"
      else if (GPS["GPSImgDirectionRef"] == "M")
        angle = (Math.PI / 180) * (GPS.GPSImgDirection["numerator"]/GPS.GPSImgDirection["denominator"] - 90);
      else
        console.log("No compass data found");

      console.log("Orientation:",GPS["Orientation"]) 

      /* If there is orientation data -- i.e. landscape/portrait etc */
      if (GPS["Orientation"] == 6) { //CCW
        angle += (Math.PI / 180) * -90
      } else if (GPS["Orientation"] == 8) { //CW
        angle += (Math.PI / 180) * 90
      } else if (GPS["Orientation"] == 3) { //180
        angle += (Math.PI / 180) * 180
      }
 
      /* If there is altitude data */
      if (typeof GPS["GPSAltitude"] !== 'undefined' && typeof GPS["GPSAltitudeRef"] !== 'undefined'){
        // Attempt to use GPS altitude:
        // (may eventually need to find EXIF field of view for correction)
        if (typeof GPS.GPSAltitude !== 'undefined' && 
            typeof GPS.GPSAltitudeRef !== 'undefined') {
          altitude = (GPS.GPSAltitude["numerator"]/GPS.GPSAltitude["denominator"]+GPS.GPSAltitudeRef);
        } else {
          altitude = 0; // none
        }
      } 

      /* only execute callback if lat (and by 
       * implication lng) exists */
      if (lat) fn(lat,lng,id,angle,altitude);
    }); 
  },

  selectImage: function(e){
    var img = this
    // save state, watch for changes by tracking 
    // stringified corner positions: 
    img._corner_state = JSON.stringify(img._corners)
    for (var i in images) {
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
    img.editing.enable.bind(img.editing)()
    img.bringToFront()
    /* If it's locked, allow event to propagate on to map below */
    if (this.editing._mode != "lock") e.stopPropagation()
  },

  saveImageIfChanged: function() {
    var img = this
    // check if image state has changed at all before saving!
    if (img.editing._mode != "lock" && img._corner_state != JSON.stringify(img._corners)) {
      window.mapKnitter.saveImage.bind(img)()
    }
  },

  dblClickImage: function (e) { 
    var img = this
    window.mapKnitter.selectImage.bind(img)
    img.editing._enableDragging()
    img.editing.enable()
    img.editing._toggleRotateDistort()
    e.stopPropagation()
  },

  saveImage: function() {
    //console.log('saving')
    var img = this
    // reset change state string:
    img._corner_state = JSON.stringify(img._corners)
    // send save request
    $.ajax('/images/update',{
      type: 'POST',
      data: {
        warpable_id: img.warpable_id,
        locked: (img.editing._mode == 'lock'),
        points: 
          img._corners[0].lng+','+img._corners[0].lat+':'+
          img._corners[1].lng+','+img._corners[1].lat+':'+
          img._corners[3].lng+','+img._corners[3].lat+':'+
          img._corners[2].lng+','+img._corners[2].lat,
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
  },

  // /maps/newbie/warpables/42, but we'll try /warpables/42 
  // as it should also be a valid restful route
  deleteImage: function() {
    var img = this
    // this should only be possible by logged-in users
    if (mapKnitter.logged_in) {
      if (confirm("Are you sure you want to delete this image? You cannot undo this.")) {
        $.ajax('/images/'+img.warpable_id,{
          dataType: "json",
          type: 'DELETE',
          beforeSend: function(e) {
            $('.mk-save').removeClass('fa-check-circle fa-times-circle fa-green fa-red').addClass('fa-spinner fa-spin')
          },
          complete: function(e) {
            $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-check-circle fa-green')
            // disable interactivity:
            img.editing._hideToolbar();
            img.editing.disable();
            // remove from Leaflet map:
            map.removeLayer(img);
            // remove from sidebar too:
            $('#warpable-'+img.warpable_id).remove()
          },
          error: function(e) {
            $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-times-circle fa-red')
          }
        })
      }
    } else {
      alert('You must be logged in to delete images.')
    }
  },

  getMap: function() {
    return this._map;
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

  addKml: function() {
    var url = prompt("Enter a KML URL");
    var kml = omnivore.kml(url)
      .on('ready', function() { console.log(kml);
        map.fitBounds(kml.getBounds());
        $.each(kml._layers,function(i,marker) {
          marker.bindPopup('<p><img width="100%;" src="'+marker.feature.properties.__imgUrl+'" /></p><p width="100%;">'+marker.feature.properties.__data+"</p>");
        });
      }).addTo(map);

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

    // https://gitlab.com/IvanSanchez/Leaflet.GridLayer.GoogleMutant
    var googleMutant = L.gridLayer.googleMutant({
      type: 'satellite', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
      maxZoom: 24,
      maxNativeZoom: 20,
      opacity:0.5
    }).addTo(this._map);

    var baseMaps = {
        "OpenStreetMap": mapbox,
        "Google Satellite": googleMutant
    };
    // eventually, annotations
    var overlayMaps = {
    };
   
    var layersControl = new L.Control.Layers(baseMaps,overlayMaps);
    this._map.addControl(layersControl);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale().addTo(map);
  }

});
