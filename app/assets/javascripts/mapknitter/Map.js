MapKnitter.Map = MapKnitter.Class.extend({

  initialize: function(options) {
    this._zoom = options.zoom || 0;
    this._latlng = L.latLng(options.latlng);
    this.logged_in = options.logged_in;
    this.anonymous = options.anonymous;

    /* Initialize before map in order to add to layers; probably it can be done later too */
    var google = new L.Google("SATELLITE",{
      maxZoom: 24,
      maxNativeZoom: 20,
      opacity:0.5
    });

    this._map = L.map('knitter-map-pane', { 
      zoomControl: false,
      layers: [google]
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
  addImage: function(url,id,lat,lng,angle) {

    var img = new L.DistortableImageOverlay(url);
    img.geocoding = { lat: lat,
                      lng: lng,
                      angle: angle};
    images.push(img);
    img.warpable_id = id
    img.addTo(map);
    L.DomEvent.on(img._image, 'mousedown', window.mapKnitter.selectImage, img);
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
      function(lat,lng,id,angle) {
        /* Display button to place this image with GPS tags. */
        $('.add-image-gps-'+id).attr('data-lat',lat);
        $('.add-image-gps-'+id).attr('data-lng',lng);
        if (angle) $('.add-image-gps-'+id).attr('data-angle',angle);
        $('.add-image-gps-'+id).show();
        $('.add-image-gps-'+id).on('click',function() {
          $('.add-image-'+id).hide();
          $('#uploadModal').modal('hide');
          window.mapKnitter._map.setZoom(18);
          window.mapKnitter._map.setView(
            [$(this).attr('data-lat'),
             $(this).attr('data-lng')]);
          angle = $(this).attr('data-angle') || 0;
          img = window.mapKnitter.addImage(url,
                                     id,
                                     $(this).attr('data-lat'),
                                     $(this).attr('data-lng'),
                                     angle);
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

      /* If there is altitude data; should separate this 
       * from if there's rotation/heading data
       */
      if (typeof GPS["GPSAltitude"] !== 'undefined' && typeof GPS["GPSAltitudeRef"] !== 'undefined'){
 
        // Attempt to use GPS compass heading; will require 
        // some trig to calc corner points, which you can find below:
        //
        // "T" refers to "True north", so -90.
        if (GPS["GPSImgDirectionRef"] == "T")
          angle = (Math.PI / 180) * (GPS.GPSImgDirection["numerator"]/GPS.GPSImgDirection["denominator"] - 90) ;
        else if (GPS["GPSImgDirectionRef"] == "M") // "M" refers to "Magnetic north", there might be a marginal difference not sure how much.
          angle = (Math.PI / 180) * (GPS.GPSImgDirection["numerator"]/GPS.GPSImgDirection["denominator"] - 90) ;
        else
          console.log("No angle found");
 
        /*
        // Attempt to use GPS altitude:
        if (typeof GPS.GPSAltitude !== 'undefined' && 
            typeof GPS.GPSAltitudeRef !== 'undefined' && 
            typeof act_height!== 'undefined' && 
            typeof act_width !== 'undefined') {
          Altitude = (GPS.GPSAltitude["numerator"]/GPS.GPSAltitude["denominator"]+GPS.GPSAltitudeRef) / 10;

          // Convert altitude to zoom, for large altitude it is not a possible conversion as at any altitude it 
          // is not possible for a camera to see a complete view of earth
          // For small altitudes the following will work fine. It is still experimental and needs testing. 
          // For correction based on altitude we need the original dimensions of the image. 
          
          // Some GPS data shows altitude as zero even though it is not, we need to account for errors or we will have infinity zoom.
          if (Altitude >0)
            Altitude_to_zoom = ( (act_height/Img_height) * (act_width/Img_width) ) / Altitude;           
          else
            Altitude_to_zoom = Map.zoom * 1.3;
          
          pixel_ratio = 2 * Altitude_to_zoom;
          console.log("Zoom for image"+(Altitude_to_zoom))
        } else {
          pixel_ratio = 2 * (Map.zoom * 1.3);
          console.log("Cannot use altitude data");
          console.log("Zoom"+Map.zoom*1.3)
        }

        // Calculate the distance to move on map, Mapknitter uses Map.zoom = Zoom / 1.3.
        var hh = (Img_height / 2) / pixel_ratio, wh=(Img_width / 2) / pixel_ratio; 

        var points = Array(4);
        var Cos = Math.cos(Angle);
        var Sin = Math.sin(Angle);
  
        // Position and rotate the image mathematically.
        points[0]= [ Cos * (-1*wh) - Sin * (-1*hh) + x, Sin * (-1*wh ) + Cos * (-1*hh) + y ];
        points[1]= [ Cos * (wh)    - Sin * (-1*hh) + x, Sin * (wh)     + Cos * (-1*hh) + y ];
        points[2]= [ Cos * (wh)    - Sin * (hh   ) + x, Sin * (wh)     + Cos * (hh)    + y ];
        points[3]= [ Cos * (-1*wh) - Sin * (hh   ) + x, Sin * (-1*wh)  + Cos * (hh)    + y ];
  
        */

      } 

      /* only execute callback if lat (and by 
       * implication lng) exists */
      if (lat) fn(lat,lng,id,angle);
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

    var baseMaps = {
        "OpenStreetMap": mapbox,
        "Google Satellite": google
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
