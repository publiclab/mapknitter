IO.include("frame/Chain.js");
IO.include("frame/Hash.js");
IO.include("frame/Namespace.js");
IO.include("frame/Reflection.js");

function defined(o) {
	return (o !== undefined);
}

function copy(o) { // todo check for circular refs
	if (o == null || typeof(o) != 'object') return o;
	var c = new o.constructor();
	for(var p in o)	c[p] = copy(o[p]);
	return c;
}

function isUnique(arr) {
	var l = arr.length;
	for(var i = 0; i < l; i++ ) {
		if (arr.lastIndexOf(arr[i]) > i) return false;
	}
	return true;
}

/** Returns the given string with all regex meta characters backslashed. */
RegExp.escapeMeta = function(str) {
	return str.replace(/([$^\\\/()|?+*\[\]{}.-])/g, "\\$1");
}
