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
	 * Enables $D's methods
	 */
	enable: function() {
		$D.enabled = true
		if (console.firebug) {
			$D.log = console.debug
			$D.warn = console.warn
			$D.err = console.error
			$D.trace = console.trace
			$D.verbose_trace = $D._verbose_trace
		}
		else {
			$D.log = $D._log
			$D.warn = $D._warn
			$D.err = $D._err
			$D.trace = $D._trace
			$D.verbose_trace = $D._verbose_trace
		}
		$l = $D.log
	},
	/**
	 * Disables $D's methods
	 */
	disable: function() {
		$D.enabled = false
		
		(['log', 'warn', 'err', 'trace', 'verbose_trace']).each(function(m) {
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
	},
	
	/**
	 * @function
	 * Sends a descriptive stack trace to the console.
	 */
	verbose_trace: Prototype.emptyFunction,
	
	_verbose_trace: function(msg) {
		console.log("An exception occurred in the script. Error name: " + msg.name + ". Error description: " + msg.description + ". Error number: " + msg.number + ". Error message: " + msg.message + ". Line number: "+ msg.lineNumber)
	},
	
	object_count: function() {
		return $D.node_count() + $D.way_count() + $D.relation_count()
	},
	
	way_count: function() {
		return Geohash.objects.findAll(function(o){return o.get_type() == 'Way'}).length
	},
	
	relation_count: function() {
		return Geohash.objects.findAll(function(o){return o.get_type() == 'Relation'}).length
	},
	
	node_count: function() {
		var c = 0
		Geohash.objects.each(function(o) {
			c += o.nodes.length
		})
		return c
	}
}

/**
 * Alias for $D.log
 */
$l = $D.log
