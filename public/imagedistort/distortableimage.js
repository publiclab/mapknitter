// Creates the Distortable Image Object by extending the ImageOverlay class in leaflet
// Should be used to give a unique id to the image

var c=1;
L.DistortableImage= L.ImageOverlay.extend({
		_initImage: function () {
		var imageid="img" + c;
		var img = this._image = L.DomUtil.create('img',
		'leaflet-image-layer ' +  'leaflet-zoom-animated');
		img.onselectstart = L.Util.falseFn;
		img.onmousemove = L.Util.falseFn;
		img.onload = L.bind(this.fire, this, 'load');
		img.src = this._url;
		img.alt = this.options.alt;
		img.id="img"+c; //Image id 'img1' provided to DOM element
		},

})
