MapKnitter.Map = MapKnitter.Class.extend({

  initialize: function (options) {
    this._zoom = options.zoom || 0;
    this._latlng = L.latLng(options.latlng);
    this.logged_in = options.logged_in;
    this.anonymous = options.anonymous;

    var mapknitter = this;

    L.Icon.Default.imagePath = '/assets/leaflet/dist/images/';

    /* Initialize before map in order to add to layers; probably it can be done later too */
    var google = new L.Google("SATELLITE", {
      maxZoom: 24,
      maxNativeZoom: 20,
      opacity: 0.5
    });

    this._map = L.map('knitter-map-pane', {
      zoomControl: false,
    }).setView(this._latlng, this._zoom);

    // make globally accessible map namespace for knitter.js
    map = this._map

    if (!options.readOnly) {
      saveBtn = L.easyButton('fa-check-circle fa-green mk-save',
        function () { },
        'Save status',
        this._map,
        this
      )
    }

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
        // only already-placed images:
        if (warpable.nodes.length > 0) {

          var downloadEl = $('.img-download-' + warpable.id),
            imgEl = $('#full-img-' + warpable.id);

          downloadEl.click(function () {

            downloadEl.html("<i class='fa fa-circle-o-notch fa-spin'></i>");

            imgEl[0].onload = function () {

              var height = imgEl.height(),
                width = imgEl.width(),
                nw = map.latLngToContainerPoint(warpable.nodes[0]),
                ne = map.latLngToContainerPoint(warpable.nodes[1]),
                se = map.latLngToContainerPoint(warpable.nodes[2]),
                sw = map.latLngToContainerPoint(warpable.nodes[3]),
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

              downloadEl.html("<i class='fa fa-download'></i>");

            }

            imgEl[0].src = $('.img-download-' + warpable.id).attr('data-image');

          });

          var corners = [
            L.latLng(warpable.nodes[0].lat,
              warpable.nodes[0].lon),
            L.latLng(warpable.nodes[1].lat,
              warpable.nodes[1].lon),
            L.latLng(warpable.nodes[3].lat,
              warpable.nodes[3].lon),
            L.latLng(warpable.nodes[2].lat,
              warpable.nodes[2].lon)
          ];

          var img = L.distortableImageOverlay(
            warpable.srcmedium,
            {
              keymapper: false,
              actions: mapknitter.imgActionArray(),
              corners: corners,
              mode: 'lock'
            }).addTo(map);

          imgGroup.addLayer(img);

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
            L.DomEvent.on(imgGroup, 'layeradd', mapknitter.setupEvents, this);
            L.DomEvent.on(img._image, 'load', function () {  /* never hitting this?? */
              var img = this;
              window.mapKnitter.setupToolbar(img)
            }, img);
          }
        }
      });

    });

    /* Deselect images if you click on the sidebar, 
     * otherwise hotkeys still fire as you type. */
    $('.sidebar').click(function () { $.each(images, function (i, img) { img.editing.disable() }) })
    /* Deselect images if you click on the map. */
    //this._map.on('click',function(){ $.each(images,function(i,img){ img.editing.disable() }) })

    // hi res:
    //img._image.src = img._image.src.split('_medium').join('')
  },

  customExportAction: function () {
    var action = L.EditAction.extend({
      initialize: function (map, group, options) {

        var use = '<use xlink:href="#get_app"></use>';
        var symbol = '<symbol viewBox="0 0 18 18" id="get_app" xmlns="http://www.w3.org/2000/svg"><path fill="#058dc4" d="M14.662 6.95h-3.15v-4.5H6.787v4.5h-3.15L9.15 12.2l5.512-5.25zM3.637 13.7v1.5h11.025v-1.5H3.637z"/></symbol></svg>'

        options = options || {};
        options.toolbarIcon = { 
          html: '<svg>' + use + symbol + '</svg>',
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

    L.DomEvent.on(img._image, 'mouseup', window.mapKnitter.saveImageIfChanged, img);
    L.DomEvent.on(img._image, 'touchend', window.mapKnitter.saveImageIfChanged, img);
  },

  /* 
   * Setup toolbar and events
   */
  setupToolbar: function (img) {
    img.on('edit', window.mapKnitter.saveImageIfChanged, img);
    img.on('delete', window.mapKnitter.deleteImage, img)

    // Override default delete to add a confirm()
    img.on('toolbar:created',
      function () {
        this.editing.toolbar.options.actions[1].prototype.addHooks = function () {
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
    var img = L.distortableImageOverlay(
      url,
      {
        actions: this.imgActionArray(),
        keymapper: false
      }
    );
    img.geocoding = {
      lat: lat,
      lng: lng,
      altitude: altitude,
      angle: angle
    };
    images.push(img);
    img.warpable_id = id
    img.addTo(map);

    var exportA = this.customExportAction();

    var imgGroup = L.distortableCollection({
      actions: [exportA]
    }).addTo(map);

    L.DomEvent.on(img._image, 'click', window.mapKnitter.selectImage, img);
    img.on('deselect', window.mapKnitter.saveImageIfChanged, img)
    L.DomEvent.on(img._image, 'dblclick', window.mapKnitter.dblClickImage, img);
    L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing);
    L.DomEvent.on(img._image, 'load', function () {
      var img = this
      imgGroup.addLayer(img);
      window.mapKnitter.setupToolbar(img);

      /* use geodata */
      if (img.geocoding && img.geocoding.lat) {
        /* move the image to this newly discovered location */
        var center = L.latLngBounds(img._corners).getCenter(),
          latBy = img.geocoding.lat - center.lat,
          lngBy = img.geocoding.lng - center.lng

        for (var i = 0; i < 4; i++) {
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

          elevator.getElevationForLocations({
            'locations': [{ lat: lat, lng: lng }]
          }, function (results, status) {
            console.log("Photo taken from " + img.geocoding.altitude + " meters above sea level");
            console.log("Ground is " + results[0].elevation + " meters above sea level");
            console.log("Photo taken from " + (img.geocoding.altitude - results[0].elevation) + " meters");
            var a = img.geocoding.altitude - results[0].elevation,
              fov = 50,
              A = fov * (Math.PI / 180),
              width = 2 * (a / Math.tan(A))
            currentWidth = (img._corners[2].distanceTo(img._corners[1]) +
              img._corners[1].distanceTo(img._corners[2])) / 2

            console.log("Photo should be " + width + " meters wide");
            img.editing._scaleBy(width / currentWidth);
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

  geocodeImageFromId: function (dom_id, id, url) {
    window.mapKnitter.geocodeImage(
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

  saveImageIfChanged: function () {
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
    img.editing._toggleRotateScale()
    e.stopPropagation()
  },

  saveImage: function () {
    //console.log('saving')
    var img = this
    // reset change state string:
    img._corner_state = JSON.stringify(img._corners)
    // send save request
    $.ajax('/images/update', {
      type: 'POST',
      data: {
        warpable_id: img.warpable_id,
        locked: (img.editing._mode == 'lock'),
        points:
          img._corners[0].lng + ',' + img._corners[0].lat + ':' +
          img._corners[1].lng + ',' + img._corners[1].lat + ':' +
          img._corners[3].lng + ',' + img._corners[3].lat + ':' +
          img._corners[2].lng + ',' + img._corners[2].lat,
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
    var img = this
    // this should only be possible by logged-in users
    if (mapKnitter.logged_in) {
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
            img.editing._removeToolbar();
            img.editing.disable();
            // remove from Leaflet map:
            map.removeLayer(img);
            // remove from sidebar too:
            $('#warpable-' + img.warpable_id).remove()
          },
          error: function (e) {
            $('.mk-save').removeClass('fa-spinner fa-spin').addClass('fa-times-circle fa-red')
          }
        })
      }
    } else {
      alert('You must be logged in to delete images.')
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

    var layersControl = new L.Control.Layers(baseMaps, overlayMaps);
    this._map.addControl(layersControl);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale().addTo(map);
  },

  imgActionArray: function() {
    return [CToggleTransparency, CToggleOutline, CToggleLock, CToggleRotateScale, CToggleOrder, CEnableEXIF, CRestore, CExport, CDelete];
  }
});

/**
 * ALL BELOW ARE QUICK OVERRIDE FOR SVG EXTERENAL PATH NOT BEING FOUND IN RAILS -
 * should be removed on rails 5 implementation and switch to being loaded with webpacker
 * */

var CToggleTransparency = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip,
      symbol;

    if (edit._transparent) {
      href = '<use xlink:href="#opacity"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="opacity" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M13.245 6L9 1.763 4.755 6A6.015 6.015 0 0 0 3 10.23c0 1.5.585 3.082 1.755 4.252a5.993 5.993 0 0 0 8.49 0A6.066 6.066 0 0 0 15 10.23c0-1.5-.585-3.06-1.755-4.23zM4.5 10.5c.008-1.5.465-2.453 1.32-3.3L9 3.952l3.18 3.285c.855.84 1.313 1.763 1.32 3.263h-9z"/></symbol>';
      tooltip = 'Make Image Opaque';
    } else {
      href = '<use xlink:href="#opacity-empty"></use>';
      symbol = '<symbol viewBox="0 0 14 18" id="opacity-empty" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" stroke="#0078A8" stroke-width="1.7" d="M10.708 6.25A5.113 5.113 0 0 1 12.2 9.846c0 1.275-.497 2.62-1.492 3.614a5.094 5.094 0 0 1-7.216 0A5.156 5.156 0 0 1 2 9.846c0-1.275.497-2.601 1.492-3.596L7.1 2.648l3.608 3.602zm0 0L7.1 2.648 3.492 6.25A5.113 5.113 0 0 0 2 9.846c0 1.275.497 2.62 1.492 3.614a5.094 5.094 0 0 0 7.216 0A5.156 5.156 0 0 0 12.2 9.846a5.113 5.113 0 0 0-1.492-3.596z"/></symbol>';
      tooltip = 'Make Image Transparent';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var editing = this._overlay.editing;

    editing._toggleTransparency();
  }
});

var CToggleOutline = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip,
      symbol;
  

    if (edit._outlined) {
      href = '<use xlink:href="#border_clear"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="border_clear" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M5.25 3.75h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm3-3h1.5v-1.5h-1.5v1.5zm0 3h1.5v-1.5h-1.5v1.5zm-6 0h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm6 6h1.5v-1.5h-1.5v1.5zm6 3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm0-9h1.5v-1.5h-1.5v1.5zm-6 0h1.5v-1.5h-1.5v1.5zm6-4.5v1.5h1.5v-1.5h-1.5zm-6 1.5h1.5v-1.5h-1.5v1.5zm3 12h1.5v-1.5h-1.5v1.5zm0-6h1.5v-1.5h-1.5v1.5zm0-6h1.5v-1.5h-1.5v1.5z"/></symbol>';
      tooltip = 'Remove Border';
    } else {
      href = '<use xlink:href="#border_outer"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="border_outer" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M9.75 5.25h-1.5v1.5h1.5v-1.5zm0 3h-1.5v1.5h1.5v-1.5zm3 0h-1.5v1.5h1.5v-1.5zm-10.5-6v13.5h13.5V2.25H2.25zm12 12H3.75V3.75h10.5v10.5zm-4.5-3h-1.5v1.5h1.5v-1.5zm-3-3h-1.5v1.5h1.5v-1.5z" /></symbol>'
      tooltip = 'Add Border';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var editing = this._overlay.editing;

    editing._toggleOutline();
  }
});

var CDelete = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var href = '<use xlink:href="#delete_forever"></use>';
    var symbol = '<symbol viewBox="0 0 18 18" id="delete_forever" xmlns="http://www.w3.org/2000/svg"><path fill="#c10d0d" d="M4.5 14.25c0 .825.675 1.5 1.5 1.5h6c.825 0 1.5-.675 1.5-1.5v-9h-9v9zm1.845-5.34l1.058-1.058L9 9.443l1.59-1.59 1.058 1.058-1.59 1.59 1.59 1.59-1.058 1.058L9 11.558l-1.59 1.59-1.058-1.058 1.59-1.59-1.597-1.59zM11.625 3l-.75-.75h-3.75l-.75.75H3.75v1.5h10.5V3h-2.625z" /></symbol>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: 'Delete Image'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var editing = this._overlay.editing;

    editing._removeOverlay();
  }
});

var CToggleLock = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip,
      symbol;

    if (edit._mode === 'lock') {
      href = '<use xlink:href="#unlock"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="unlock" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M13.5 6h-.75V4.5C12.75 2.43 11.07.75 9 .75 6.93.75 5.25 2.43 5.25 4.5h1.5A2.247 2.247 0 0 1 9 2.25a2.247 2.247 0 0 1 2.25 2.25V6H4.5C3.675 6 3 6.675 3 7.5V15c0 .825.675 1.5 1.5 1.5h9c.825 0 1.5-.675 1.5-1.5V7.5c0-.825-.675-1.5-1.5-1.5zm0 9h-9V7.5h9V15zM9 12.75c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5z"/></symbol>';
      tooltip = 'Unlock';
    } else {
      href = '<use xlink:href="#lock"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="lock" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M13.5 6h-.75V4.5C12.75 2.43 11.07.75 9 .75 6.93.75 5.25 2.43 5.25 4.5V6H4.5C3.675 6 3 6.675 3 7.5V15c0 .825.675 1.5 1.5 1.5h9c.825 0 1.5-.675 1.5-1.5V7.5c0-.825-.675-1.5-1.5-1.5zM6.75 4.5A2.247 2.247 0 0 1 9 2.25a2.247 2.247 0 0 1 2.25 2.25V6h-4.5V4.5zM13.5 15h-9V7.5h9V15zM9 12.75c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5z"/></symbol>';
      tooltip = 'Lock';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var editing = this._overlay.editing;

    editing._toggleLock();
  }
});

var CToggleRotateScale = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip,
      symbol;

    if (edit._mode === 'rotateScale') {
      href = '<use xlink:href="#transform"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="transform" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M16.5 13.5V12H6V3h1.5L5.25.75 3 3h1.5v1.5h-3V6h3v6c0 .825.675 1.5 1.5 1.5h6V15h-1.5l2.25 2.25L15 15h-1.5v-1.5h3zM7.5 6H12v4.5h1.5V6c0-.825-.675-1.5-1.5-1.5H7.5V6z"/></symbol>';
      tooltip = 'Distort';
    } else {
      href = '<use xlink:href="#crop_rotate"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="crop_rotate" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M5.603 16.117C3.15 14.947 1.394 12.57 1.125 9.75H0C.383 14.37 4.245 18 8.963 18c.172 0 .33-.015.495-.023L6.6 15.113l-.997 1.005zM9.037 0c-.172 0-.33.015-.495.03L11.4 2.888l.998-.998a7.876 7.876 0 0 1 4.477 6.36H18C17.617 3.63 13.755 0 9.037 0zM12 10.5h1.5V6A1.5 1.5 0 0 0 12 4.5H7.5V6H12v4.5zM6 12V3H4.5v1.5H3V6h1.5v6A1.5 1.5 0 0 0 6 13.5h6V15h1.5v-1.5H15V12H6z" /></symbol>';
      tooltip = 'Rotate+Scale';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var editing = this._overlay.editing;

    editing._toggleRotateScale();
  }
});

var CExport = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var href = '<use xlink:href="#get_app"></use>';
    var symbol = '<symbol viewBox="0 0 18 18" id="get_app" xmlns="http://www.w3.org/2000/svg"><path fill="#058dc4" d="M14.662 6.95h-3.15v-4.5H6.787v4.5h-3.15L9.15 12.2l5.512-5.25zM3.637 13.7v1.5h11.025v-1.5H3.637z"/></symbol>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: 'Export Image'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var editing = this._overlay.editing;

    editing._getExport();
  }
});

var CToggleOrder = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip,
      symbol;

    if (edit._toggledImage) {
      href = '<use xlink:href="#flip_to_front"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="flip_to_front" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M2.25 9.75h1.5v-1.5h-1.5v1.5zm0 3h1.5v-1.5h-1.5v1.5zm1.5 3v-1.5h-1.5a1.5 1.5 0 0 0 1.5 1.5zm-1.5-9h1.5v-1.5h-1.5v1.5zm9 9h1.5v-1.5h-1.5v1.5zm3-13.5h-7.5a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h7.5c.825 0 1.5-.675 1.5-1.5v-7.5c0-.825-.675-1.5-1.5-1.5zm0 9h-7.5v-7.5h7.5v7.5zm-6 4.5h1.5v-1.5h-1.5v1.5zm-3 0h1.5v-1.5h-1.5v1.5z"/></symbol>';
      tooltip = 'Stack to Front';
    } else {
      href = '<use xlink:href="#flip_to_back"></use>';
      symbol = '<symbol viewBox="0 0 18 18" id="flip_to_back" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M6.75 5.25h-1.5v1.5h1.5v-1.5zm0 3h-1.5v1.5h1.5v-1.5zm0-6a1.5 1.5 0 0 0-1.5 1.5h1.5v-1.5zm3 9h-1.5v1.5h1.5v-1.5zm4.5-9v1.5h1.5c0-.825-.675-1.5-1.5-1.5zm-4.5 0h-1.5v1.5h1.5v-1.5zm-3 10.5v-1.5h-1.5a1.5 1.5 0 0 0 1.5 1.5zm7.5-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0 6c.825 0 1.5-.675 1.5-1.5h-1.5v1.5zm-10.5-7.5h-1.5v9a1.5 1.5 0 0 0 1.5 1.5h9v-1.5h-9v-9zm7.5-1.5h1.5v-1.5h-1.5v1.5zm0 9h1.5v-1.5h-1.5v1.5z"/></symbol>';
      tooltip = 'Stack to Back';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var editing = this._overlay.editing;

    editing._toggleOrder();
  }
});

var CEnableEXIF = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var href = '<use xlink:href="#explore"></use>';
    var symbol = '<symbol viewBox="0 0 18 18" id="explore" xmlns="http://www.w3.org/2000/svg"><path fill="#0078A8" d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9c0 4.14 3.36 7.5 7.5 7.5 4.14 0 7.5-3.36 7.5-7.5 0-4.14-3.36-7.5-7.5-7.5zM9 15c-3.308 0-6-2.693-6-6 0-3.308 2.692-6 6-6 3.307 0 6 2.692 6 6 0 3.307-2.693 6-6 6zm-4.125-1.875l5.633-2.617 2.617-5.633-5.633 2.617-2.617 5.633zM9 8.175c.457 0 .825.367.825.825A.823.823 0 0 1 9 9.825.823.823 0 0 1 8.175 9c0-.457.367-.825.825-.825z"/></symbol>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: 'Geolocate Image'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var image = this._overlay.getElement();

    EXIF.getData(image, L.EXIF(image));
  }
});

var CRestore = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var href = '<use xlink:href="#restore"></use>';
    var symbol = '<symbol viewBox="0 0 18 18" id="restore" xmlns="http://www.w3.org/2000/svg"><path fill="#058dc4" d="M15.67 3.839a.295.295 0 0 0-.22.103l-5.116 3.249V4.179a.342.342 0 0 0-.193-.315.29.29 0 0 0-.338.078L3.806 7.751v-4.63h-.002l.002-.022c0-.277-.204-.502-.456-.502h-.873V2.6c-.253 0-.457.225-.457.503l.002.026v10.883h.005c.021.257.217.454.452.455l.016-.002h.822c.013.001.025.004.038.004.252 0 .457-.225.457-.502a.505.505 0 0 0-.006-.068V9.318l6.001 3.811a.288.288 0 0 0 .332.074.34.34 0 0 0 .194-.306V9.878l5.12 3.252a.288.288 0 0 0 .332.073.34.34 0 0 0 .194-.306V4.18a.358.358 0 0 0-.09-.24.296.296 0 0 0-.218-.1z"/></symbol>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + symbol + '</svg>',
      tooltip: 'Restore'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var editing = this._overlay.editing;

    editing._restore();
  }
});
