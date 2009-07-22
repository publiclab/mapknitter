//= require "geometry"
//= require "debug"

/**
 * @name Math.in_range
 * @function
 * @memberOf Math
 * Determines if a value is in a specified range. Order is not significant for the endpoints of
 * the range.
 * @param {Number} v  Value to test
 * @param {Number} r1 One endpoint of the range
 * @param {Number} r2 Other endpoint of the range
 * @return Whether the value is in the range
 * @type Boolean
 */
Math.in_range = function(v,r1,r2) {
	return (v > Math.min(r1,r2) && v < Math.max(r1,r2))
}

/**
 * Finds the value of the argument, evaluating it as a function if possible.
 * @param {Object} obj       Object to find value of
 * @param {Object} [context] Context in which to evaluate the function, if needed.
 * @return If the argument is a function, the result of evaluating it. Else,
 *         the argument itself.
 */
Object.value = function(obj, context) {
	
    if(Object.isFunction(obj)) {
		context = context || this
		f = obj.bind(context)
		return f()
	}
    return obj
}

// based on jQuery.extend
Object.deep_extend = function() {
    // copy reference to target object
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = true, options, name, src, copy;

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !Object.isFunction(target) ) {
        target = {};
    }

    for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }

                // Recurse if we're merging object values
                if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
                    var clone;

                    if ( src ) {
                        clone = src;
                    } else if ( Object.isArray(copy) ) {
                        clone = [];
                    } else if ( typeof copy == 'object' ) {
                        clone = {};
                    } else {
                        clone = copy;
                    }

                    // Never move original objects, clone them
                    target[ name ] = Object.deep_extend(clone, copy );

                // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
}

/**
 * Returns the number, rounded to a certain precision
 * @param {Number} prec Number of significant figures in the result
 * @return The rounded number
 * @type Number
 */
Number.prototype.to_precision = function(prec){
	return (this * (1/prec)).round()/(1/prec)
}

/**
 * Rotates view slowly for cool demo purposes.
 */ 
Cartagen.demo = function() { Map.rotate += 0.005 }
