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

import 'bootstrap/dist/js/bootstrap';
import 'jquery';
import 'jquery/dist/jquery';
import 'jquery-ujs';
import 'jquery-ujs/src/rails';
import 'leaflet/dist/leaflet';
import 'leaflet-providers/leaflet-providers';
import 'leaflet-toolbar/dist/leaflet.toolbar';
import 'leaflet-distortableimage/dist/leaflet.distortableimage';
import 'leaflet-easybutton/src/easy-button';
import 'sparklines/source/sparkline';
import 'glfx-js/dist/glfx';
import 'webgl-distort/dist/webgl-distort';

import '../src/javascripts/uploads.js';
import '../src/javascripts/mapknitter/core/Class.js';
import '../src/javascripts/mapknitter/core/Resources.js';
import '../src/javascripts/mapknitter/Annotations.js';
import '../src/javascripts/mapknitter/Annotations.style.js';
import '../src/javascripts/mapknitter/Annotations.Toolbar.js';
import '../src/javascripts/mapknitter/Map.js';
import '../src/javascripts/annotations-embed-legacy.js';
import '../src/javascripts/annotations-legacy.js';
import '../src/javascripts/annotations.js';
import '../src/javascripts/front_ui.js';
import '../src/javascripts/Google.js';
import '../src/javascripts/knitter.js';
import '../src/javascripts/mapknitter.js';
import '../src/javascripts/maps.js';
import '../src/javascripts/tags.js';


//= require_self

// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)
