// cartagen.js
//
// Copyright (C) 2009 Jeffrey Warren, Design Ecology, MIT Media Lab
//
// This file is part of the Cartagen mapping framework. Read more at
// <http://cartagen.org>
//
// Cartagen is free software: you can redistribute it and/or modify
// it under the terms of the MIT License. You should have received a copy
// of the MIT License along with Cartagen.  If not, see
// <http://www.opensource.org/licenses/mit-license.php>.
//

// these belong in other objects... move them
var objects = []

PhoneGap = window.DeviceInfo && DeviceInfo.uuid != undefined // temp object unitl PhoneGap is initialized

if (typeof cartagen_base_uri == 'undefined') {
	/**
	 * Path to the cartagen directory. Defaults to "cartagen", which works only
	 * if the cartagen directory is named "cartagen" and is located in the
	 * same directoy as the current page. This should be set before Cartagen
	 * is loaded if it needs to be changed.
	 * 
	 * @type String
	 */
    cartagen_base_uri = 'cartagen'
}

/**
 * An array of scripts that will be loaded when Cartagen is initialized.
 * 
 * @type Array (of String)
 * @see Cartagen.initialize
 */
var scripts = []

// load phonegap js if needed
if(window.PhoneGap) {
	scripts.unshift(cartagen_base_uri + '/lib/phonegap/phonegap.base.js',
				 cartagen_base_uri + '/lib/phonegap/geolocation.js',
				 cartagen_base_uri + '/lib/phonegap/iphone/phonegap.js',
				 cartagen_base_uri + '/lib/phonegap/iphone/geolocation.js')
}

// if (Prototype.Browser.MobileSafari) $('brief').hide()
