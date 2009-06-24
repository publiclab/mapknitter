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
	context = context || this
    if(Object.isFunction(obj)) return obj.bind(this)()
    return obj
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
