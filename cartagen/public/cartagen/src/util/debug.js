/**
 * @namespace $D is the debuggin namespace - it has a collection of tools to debug
 *            Cartagen, and can be enabled/disabled. By default, debug mode is
 *            only enabled if "debug" is passed as true to Cartagen.setup.
 *            All $D methods have been tested in firebug and safari 4, and most work
 *            in Chrome.
 */
$D = {
	/**
	 * Controls whether $D is enabled. If disabled, none of the $D methods
	 * will do anything. Defaults to true if "console" is defined, else false.
	 * Do not set directly; use enable() and disable().
	 * @type Boolean
	 */
	enabled: false,
	/**
	 * Performs initialization, including broswer-specific overrides for better debugging
	 */
	init: function(){
		if (Cartagen.debug) {
			$D.enable()
		}
	},
	/**
	 * Enables $D's methods
	 */
	enable: function() {
		$D.enabled = true
		if (console.firebug) {
			$D.log = console.debug
			$D.warn = console.warn
			$D.err = console.error
			$D.trace = console.trace
		}
		else {
			$D.log = $D._log
			$D.warn = $D._warn
			$D.err = $D._err
			$D.trace = $D._trace
		}
		$l = $D.log
	},
	/**
	 * Disables $D's methods
	 */
	disable: function() {
		$D.enabled = false
		
		(['log', 'warn', 'err', 'trace']).each(function(m) {
			$D[m] = Prototype.emptyFunction
		})
	},

	/**
	 * @function
	 * Logs to the console. In firebug, links to the line number from which the
	 * call was made. Also available as $l.
	 * @param {Object} msg Object to log
	 */
	log: Prototype.emptyFunction,
	
	_log: function(msg) {
		console.log(msg)
	},
	
	/**
	 * @function
	 * Sends a warning to the console.
	 * @param {Object} msg Object to send with warning
	 */
	warn: Prototype.emptyFunction,
	
	_warn: function(msg) {
		console.warn(msg)
	},
	
	/**
	 * @function
	 * Sends a error to the console.
	 * @param {Object} msg Object to send with error
	 */
	err: Prototype.emptyFunction,
	
	_err: function(msg) {
		console.err(msg)
	},
	
	/**
	 * @function
	 * Sends a stack trace to the console.
	 */
	trace: Prototype.emptyFunction,
	
	_trace: function() {
		console.trace()
	}
}

/**
 * Alias for $D.log
 */
$l = $D.log

// bind to event
document.observe('cartagen:init', $D.init)
