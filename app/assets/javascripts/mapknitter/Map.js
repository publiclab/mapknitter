//= require leaflet-toolbar/dist/leaflet.toolbar.js
//= require leaflet-distortableimage/dist/leaflet.distortableimage.js

MapKnitter.Map = MapKnitter.Class.extend({

  initialize: function (options) {
    this._zoom = options.zoom || 0;
    this._latlng = L.latLng(options.latlng);
    this.logged_in = options.logged_in;
    this.anonymous = options.anonymous;

    window.mapknitter = this;

    L.Icon.Default.imagePath = '/assets/leaflet/dist/images/';

    /* Initialize before map in order to add to layers; probably it can be done later too */
    var google = L.google('SATELLITE', {
      maxZoom: 24,
      maxNativeZoom: 20,
      opacity: 0.5
    });

    this._map = L.map('knitter-map-pane', {
      zoomControl: false,
    }).setView(this._latlng, this._zoom);

    // make globally accessible map namespace for knitter.js
    map = this._map;

    images = [], bounds = [];

    /* Set up basemap and drawing toolbars. */
    this.setupMap();

    var exportA = mapknitter.customExportAction();
    var imgGroup = L.distortableCollection({
      actions: [exportA]
    }).addTo(map);

    /* Load warpables data via AJAX request. */
    this._warpablesUrl = options.warpablesUrl;
    this.withWarpables(function (warpables) {
      $.each(warpables, function (i, warpable) {

        var wn = warpable.nodes;

        // only already-placed images:
        if (wn.length > 0) {
          var downloadEl = $('.img-download-' + warpable.id),
              imgEl = $('#full-img-' + warpable.id);

          downloadEl.click(function () {
            downloadEl.html('<i class="fa fa-circle-o-notch fa-spin"></i>');

            imgEl[0].onload = function () {
              var height = imgEl.height(),
                  width = imgEl.width(),
                  nw = map.latLngToContainerPoint(wn[0]),
                  ne = map.latLngToContainerPoint(wn[1]),
                  se = map.latLngToContainerPoint(wn[2]),
                  sw = map.latLngToContainerPoint(wn[3]),
                  offsetX = nw.x,
                  offsetY = nw.y,
                  displayedWidth = $('#warpable-img-' + warpable.id).width(),
                  ratio = width / displayedWidth;

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
                [0, 0, width, 0, width, height, 0, height],
                [nw.x, nw.y, ne.x, ne.y, se.x, se.y, sw.x, sw.y],
                true // trigger download
              )

              downloadEl.html('<i class="fa fa-download"></i>');
            }

            imgEl[0].src = $('.img-download-' + warpable.id).attr('data-image');
          });

          var corners = [
            L.latLng(wn[0].lat, wn[0].lon),
            L.latLng(wn[1].lat, wn[1].lon),
            L.latLng(wn[3].lat, wn[3].lon),
            L.latLng(wn[2].lat, wn[2].lon)
          ];

          var img = L.distortableImageOverlay(warpable.srcmedium, {
            keymapper: false,
            corners: corners,
            mode: 'lock'
          }).addTo(map);

          imgGroup.addLayer(img);

          bounds = bounds.concat(corners);
          mapknitter._map.fitBounds(bounds);
          images.push(img);
          img.warpable_id = warpable.id;

          if (!options.readOnly) {
            L.DomEvent.on(img._image, {
              click: mapknitter.selectImage,
              dblclick: mapknitter.dblClickImage,
              load: mapknitter.setupToolbar
            }, img);
            
            img.on('deselect', window.mapknitter.saveImageIfChanged, img)
            L.DomEvent.on(imgGroup, 'layeradd', window.mapknitter.setupEvents, this);
          }
        }
      });

    });

    // Deselect images if you click on the sidebar, otherwise hotkeys still fire as you type.
    $('.sidebar').click(function () { $.each(images, function (i, img) { img.editing.disable() }) })

    // hi res:
    //img._image.src = img._image.src.split('_medium').join('')
  },

    /** The upstream delete action also triggers a confirmation window, this one won't */ 
   customDeleteAction: function() {
     var action = L.EditAction.extend({
       initialize: function (map, overlay, options) {
         var use = 'delete_forever';

         options = options || {};
         options.toolbarIcon = {
           svg: true,
           html: use,
           tooltip: 'Delete Image'
         };

         L.EditAction.prototype.initialize.call(this, map, overlay, options);
       },

       addHooks: function () {
         this._overlay.fire('delete');
       }
     });

     return action;
   },

  customExportAction: function () {
    var action = L.EditAction.extend({
      initialize: function (map, group, options) {
        var use = 'get_app';

        options = options || {};
        options.toolbarIcon = { 
          svg: true,
          html: use,
          tooltip: 'Export Images'
        };

        L.EditAction.prototype.initialize.call(this, map, group, options);
      },

      addHooks: function () {
        var group = this._overlay;
        var exportInterval;

        var updateUI = function updateUI(data) {
          data = JSON.parse(data);
          console.log("in updateui: " + data);
          if (data.status == 'complete') clearInterval(exportInterval);
          if (data.status == 'complete' && data.jpg.match('.jpg')) alert("Export succeeded. http://export.mapknitter.org/" + data.jpg);
        }

        var addUrlToModel = function addUrlToModel(data) {
          var statusUrl = "//export.mapknitter.org" + data;
          console.log("statusUrl: " + statusUrl);

          // repeatedly fetch the status.json
          var updateInterval = function updateInterval() {
            exportInterval = setInterval(function intervalUpdater() {
              $.ajax(statusUrl + "?" + Date.now(), { // bust cache with timestamp;
                type: "GET",
                crossDomain: true
              }).done(function (data) {
                updateUI(data);
              });
            }, 3000);
          }

          /**
           * TODO: update API to say if you pass in a custom `handleStatusUrl` you must also build your own updater
           * and also create your own a frequency
           * or fix this part
           */
          $.ajax({
            url: "/export",
            type: 'POST',
            data: { status_url: statusUrl }
          }).done(function (data) {
            console.log('success!! ' + data);
            updateInterval();
          });
        }

        group.startExport({ handleStatusUrl: addUrlToModel, updater: updateUI, scale: prompt("Choose a scale or use the default (cm per pixel):", 100)});
      }
    });

    return action;
  },

  setupEvents: function (e) {
    var img = e.layer;

    L.DomEvent.on(img._image, 'mouseup', window.maknitter.saveImageIfChanged, img);
    L.DomEvent.on(img._image, 'touchend', window.mapknitter.saveImageIfChanged, img);
  },

  /* 
   * Setup toolbar and events
   */
  setupToolbar: function () {
    var img = this,
        edit = img.editing;

    edit.enable();
    // overriding the upstream Delete action so that it makes database updates in MapKnitter
    if (edit.hasTool(Delete)) { edit.removeTool(Delete); }
    edit.addTool(mapknitter.customDeleteAction());

    img.on('edit', window.mapknitter.saveImageIfChanged, img);
    img.on('delete', window.mapknitter.deleteImage, img);

    L.DomEvent.on(img._image, 'mouseup', window.mapknitter.saveImageIfChanged, img);
    L.DomEvent.on(img._image, 'touchend', window.mapknitter.saveImageIfChanged, img);
  },

  /* Add a new, unplaced, but already uploaded image to the map.
   * <lat> and <lng> are optional. */
  addImage: function(url,id,lat,lng,angle,altitude) {
    var img = L.distortableImageOverlay(url, {
      keymapper: false,
    });

    img.geocoding = {
      lat: lat,
      lng: lng,
      altitude: altitude,
      angle: angle
    };

    images.push(img);
    img.warpable_id = id;
    img.addTo(map);

    var exportA = mapknitter.customExportAction();
    var imgGroup = L.distortableCollection({
      actions: [exportA]
    }).addTo(map);

    imgGroup.addLayer(img);

    L.DomEvent.on(img._image, {
      click: mapKnitter.selectImage,
      dblclick: mapknitter.dblClickImage,
      load: mapknitter.setupToolbarAndGeocode
    }, img);

    img.on('deselect', window.mapknitter.saveImageIfChanged, img);
  },

  setupToolbarAndGeocode: function () {
    var img = this;

    mapknitter.setupToolbar.bind(img);
    mapknitter.setupGeocode.bind(img);
  },

  setupGeocode: function () {
    var img = this,
        edit = img.editing,
        geo = img.geocoding;

    /* use geodata */
    if (geo && geo.lat) {
      /* move the image to this newly discovered location */
      var center = L.latLngBounds(img.getCorners()).getCenter(),
        latBy = geo.lat - center.lat,
        lngBy = geo.lng - center.lng

      for (var i = 0; i < 4; i++) {
        img._corners[i].lat += latBy;
        img._corners[i].lng += lngBy;
      }

      edit._rotateBy(geo.angle);

      /* Attempt to convert altitude to scale factor based on Leaflet zoom;
         * for correction based on altitude we need the original dimensions of the image. 
         * This may work only at sea level unless we factor in ground level. 
         * We may also need to get camera field of view to get this even closer.
         * We could also fall back to the scale of the last-placed image.
         */
      if (geo.altitude && geo.altitude != 0) {
        var width = img._image.width, height = img._image.height
        //scale = ( (act_height/img_height) * (act_width/img_width) ) / geo.altitude;           
        //edit._scaleBy(scale);

        var elevator = new google.maps.ElevationService(),
            lat = window.mapknitter._map.getCenter().lat,
            lng = window.mapknitter._map.getCenter().lng;

        elevator.getElevationForLocations({
          'locations': [{ lat: lat, lng: lng }]
        }, function (results, status) {
          console.log("Photo taken from " + geo.altitude + " meters above sea level");
          console.log("Ground is " + results[0].elevation + " meters above sea level");
          console.log("Photo taken from " + (geo.altitude - results[0].elevation) + " meters");
          var a = geo.altitude - results[0].elevation,
              fov = 50,
              A = fov * (Math.PI / 180),
              width = 2 * (a / Math.tan(A)),
              currentWidth =
                img.getCorner(2).distanceTo(img.getCorner(1)) +
                img.getCorner(1).distanceTo(img.getCorner(2)) / 2;

          console.log("Photo should be " + width + " meters wide");
          edit._scaleBy(width / currentWidth);
          img.fire('update');
        });
      }

      img.fire('update');
      /* pan the map there too */
      window.mapknitter._map.fitBounds(L.latLngBounds(img.getCorners()));
      img._reset();
    }

    return img;
  },    

  geocodeImageFromId: function (dom_id, id, url) {
    mapknitter.geocodeImage(
      $(dom_id)[0],
      function (lat, lng, id, angle, altitude) {
        /* Display button to place this image with GPS tags. */
        $('.add-image-gps-' + id).attr('data-lat', lat);
        $('.add-image-gps-' + id).attr('data-lng', lng);
        if (angle) $('.add-image-gps-' + id).attr('data-angle', angle);
        if (altitude) $('.add-image-gps-' + id).attr('data-altitude', altitude);
        $('.add-image-gps-' + id).show();
        $('.add-image-gps-' + id).on('click', function () {
          $('.add-image-' + id).hide();
          $('#uploadModal').modal('hide');
          window.mapknitter._map.setZoom(18);
          window.mapknitter._map.setView(
            [$(this).attr('data-lat'),
            $(this).attr('data-lng')]);
          var angle = $(this).attr('data-angle') || 0;
          var altitude = $(this).attr('data-altitude') || 0;
          img = window.mapknitter.addImage(url,
            id,
            $(this).attr('data-lat'),
            $(this).attr('data-lng'),
            angle,
            altitude);
          $('#warpable-' + id + ' a').hide();
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
  geocodeImage: function (img, fn, id) {
    EXIF.getData(img, function () {
      var GPS = EXIF.getAllTags(img)

      /* If the lat/lng is available. */
      if (typeof GPS["GPSLatitude"] !== 'undefined' && typeof GPS["GPSLongitude"] !== 'undefined') {

        // sadly, encoded in [degrees,minutes,seconds] 
        var lat = (GPS["GPSLatitude"][0]) +
          (GPS["GPSLatitude"][1] / 60) +
          (GPS["GPSLatitude"][2] / 3600);
        var lng = (GPS["GPSLongitude"][0]) +
          (GPS["GPSLongitude"][1] / 60) +
          (GPS["GPSLongitude"][2] / 3600);

        if (GPS["GPSLatitudeRef"] != "N") lat = lat * -1
        if (GPS["GPSLongitudeRef"] == "W") lng = lng * -1
      }

      // Attempt to use GPS compass heading; will require 
      // some trig to calc corner points, which you can find below:

      var angle = 0;
      // "T" refers to "True north", so -90.
      if (GPS["GPSImgDirectionRef"] == "T")
        angle = (Math.PI / 180) * (GPS.GPSImgDirection["numerator"] / GPS.GPSImgDirection["denominator"] - 90);
      // "M" refers to "Magnetic north"
      else if (GPS["GPSImgDirectionRef"] == "M")
        angle = (Math.PI / 180) * (GPS.GPSImgDirection["numerator"] / GPS.GPSImgDirection["denominator"] - 90);
      else
        console.log("No compass data found");

      console.log("Orientation:", GPS["Orientation"])

      /* If there is orientation data -- i.e. landscape/portrait etc */
      if (GPS["Orientation"] == 6) { //CCW
        angle += (Math.PI / 180) * -90
      } else if (GPS["Orientation"] == 8) { //CW
        angle += (Math.PI / 180) * 90
      } else if (GPS["Orientation"] == 3) { //180
        angle += (Math.PI / 180) * 180
      }

      /* If there is altitude data */
      if (typeof GPS["GPSAltitude"] !== 'undefined' && typeof GPS["GPSAltitudeRef"] !== 'undefined') {
        // Attempt to use GPS altitude:
        // (may eventually need to find EXIF field of view for correction)
        if (typeof GPS.GPSAltitude !== 'undefined' &&
          typeof GPS.GPSAltitudeRef !== 'undefined') {
          altitude = (GPS.GPSAltitude["numerator"] / GPS.GPSAltitude["denominator"] + GPS.GPSAltitudeRef);
        } else {
          altitude = 0; // none
        }
      }

      /* only execute callback if lat (and by 
       * implication lng) exists */
      if (lat) fn(lat, lng, id, angle, altitude);
    });
  },

  selectImage: function (e) {
    var img = this;
    // var img = e.layer;
    // save state, watch for changes by tracking stringified corner positions: 
    img._corner_state = JSON.stringify(img._corners)
    /* Ensure this is enabled */
    img.editing.enable.bind(img.editing)()
    img.bringToFront()
    /* If it's locked, allow event to propagate on to map below */
    if (this.editing._mode !== "lock") { e.stopPropagation(); }
  },

  saveImageIfChanged: function () {
    var img = this,
        edit = img.editing;
    // check if image state has changed at all before saving!
    if (edit._mode != "lock" && img._corner_state != JSON.stringify(img._corners)) {
      window.mapknitter.saveImage.bind(img)()
    }
  },

  dblClickImage: function (e) {
    var img = this,
        edit = img.editing;

    edit._enableDragging();
    edit.enable();
    edit._toggleRotateScale();
    e.stopPropagation();
  },

  saveImage: function () {
    var img = this;
    // reset change state string:
    img._corner_state = JSON.stringify(img._corners)
    // send save request
    $.ajax('/images/update', {
      type: 'POST',
      data: {
        warpable_id: img.warpable_id,
        locked: (img.editing._mode == 'lock'),
        points:
          img.getCorner(0).lng + ',' + img.getCorner(0).lat + ':' +
          img.getCorner(1).lng + ',' + img.getCorner(1).lat + ':' +
          img.getCorner(3).lng + ',' + img.getCorner(3).lat + ':' +
          img.getCorner(2).lng + ',' + img.getCorner(2).lat,
      },
      beforeSend: function (e) {
        $('.mk-save').removeClass('fa-check-circle fa-times-circle fa-green fa-red').addClass('fa-spinner fa-spin')
      },
      complete: function (e) {
        $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-check-circle fa-green')
      },
      error: function (e) {
        $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-times-circle fa-red')
      }
    })
  },

  // /maps/newbie/warpables/42, but we'll try /warpables/42 
  // as it should also be a valid restful route
  deleteImage: function () {
    var img = this,
        edit = img.editing;
    // this should only be possible by logged-in users
    if (window.mapknitter.logged_in) {
      if (confirm("Are you sure you want to delete this image? You cannot undo this.")) {
        $.ajax('/images/' + img.warpable_id, {
          dataType: "json",
          type: 'DELETE',
          beforeSend: function (e) {
            $('.mk-save').removeClass('fa-check-circle fa-times-circle fa-green fa-red').addClass('fa-spinner fa-spin')
          },
          complete: function (e) {
            $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-check-circle fa-green')
            // disable interactivity:
            edit._removeToolbar();
            edit.disable();
            // remove from Leaflet map:
            map.removeLayer(img);
            // remove from sidebar too:
            $('#warpable-' + img.warpable_id).remove();
          },
          error: function (e) {
            $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-times-circle fa-red')
          }
        })
      }
    } else {
      alert('You must be logged in to delete images.');
    }
  },

  getMap: function () {
    return this._map;
  },

  /* Fetch JSON list of warpable images */
  withWarpables: function (callback) {
    if (this._warpables) {
      if (callback) { callback(this._warpables); }
    } else {
      jQuery.getJSON(this._warpablesUrl, function (warpablesData) {
        this._warpables = warpablesData;
        if (callback) { callback(this._warpables); }
      });
    }
  },

  /* withWarpable(id, "medium", function(img) { ... }) */
  withWarpable: function (id, size, callback) {
    this.withWarpables(function (warpables) {
      var url = warpables[id][size],
          img = jQuery("<img/>").attr("src", url).attr("data-warpable-id", id);

      callback(img);
    });
  },

  addKml: function () {
    var url = prompt("Enter a KML URL");
    var kml = omnivore.kml(url)
      .on('ready', function () {
        console.log(kml);
        map.fitBounds(kml.getBounds());
        $.each(kml._layers, function (i, marker) {
          marker.bindPopup('<p><img width="100%;" src="' + marker.feature.properties.__imgUrl + '" /></p><p width="100%;">' + marker.feature.properties.__data + "</p>");
        });
      }).addTo(map);
  },

  setupMap: function () {
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
      opacity: 0.5
    }).addTo(this._map);

    var baseMaps = {
      "OpenStreetMap": mapbox,
      "Google Satellite": googleMutant
    };
    // eventually, annotations
    var overlayMaps = {
    };

    var layersControl = L.control.layers(baseMaps, overlayMaps);
    this._map.addControl(layersControl);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale().addTo(map);
  },
});

