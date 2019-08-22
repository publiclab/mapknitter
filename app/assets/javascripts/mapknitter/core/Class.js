var MapKnitter = {};

/* 
 * MapKnitter.Class: A bare-bones version of Leaflet's Class feature, 
 * for simple classical inheritance. 
 * See https://github.com/Leaflet/Leaflet/blob/master/src/core/Class.js.
 */

MapKnitter.Class = function() {};
MapKnitter.Class.extend = function(obj) {
	var NewClass = function() {
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}
	};

	var F = function() {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	L.extend(proto, obj);

	var parent = this;
	NewClass.__super__ = parent.prototype;

	return NewClass;
};
MapKnitter.Class.include = function(obj) {
	L.extend(this.prototype, obj);
};