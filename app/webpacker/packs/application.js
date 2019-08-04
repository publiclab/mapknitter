// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")

import Rails from 'rails-ujs';
import Turbolinks from 'turbolinks';

Rails.start();
Turbolinks.start();

import '../src/mapknitter/core/Class.js';
import '../src/mapknitter/core/Resources.js';
import '../src/mapknitter/Annotations.js';
import '../src/mapknitter/Annotations.style.js';
import '../src/mapknitter/Annotations.Toolbar.js';
import '../src/mapknitter/Map.js';
import '../src/annotations-embed-legacy.js';
import '../src/annotations-legacy.js';
import '../src/annotations.js';
import '../src/front_ui.js';
import '../src/Google.js';
import '../src/knitter.js';
import '../src/mapknitter.js';
import '../src/maps.js';
import '../src/tags.js';
import '../src/uploads.js';
import 'bootstrap/dist/js/bootstrap';
import 'jquery';
import 'jquery/dist/jquery.js';
import 'jquery-ujs';
import 'jquery-ujs/src/rails.js';
import 'rails-ujs';
import 'leaflet/dist/leaflet';
import 'leaflet-providers/leaflet-providers.js';
import 'leaflet-toolbar/dist/leaflet.toolbar.js';
import 'leaflet-distortableimage/dist/leaflet.distortableimage.js';
import 'leaflet-easybutton/src/easy-button.js';
import 'sparklines/source/sparkline.js';
import 'glfx-js/dist/glfx.js';
import 'webgl-distort/dist/webgl-distort.js';


//= require_self

// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)
