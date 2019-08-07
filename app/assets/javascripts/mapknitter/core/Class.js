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

		// call all constructor hooks
		this.callInitHooks();
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

	proto._initHooks = [];

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parent.callInitHooks) {
			parent.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


MapKnitter.Class.include = function(obj) {
	L.extend(this.prototype, obj);
};

// @function addInitHook(fn: Function): this
// Adds a [constructor hook](#class-constructor-hooks) to the class.
MapKnitter.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
	return this;
};