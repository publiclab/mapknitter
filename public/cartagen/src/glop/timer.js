/**
 * @namespace Manages CPU usage by running main loop process,
 * monitoring loop completion, and adjusting interval to compensate.
 */
var TimerManager = {
	/**
	 * Date of last execution of TimerManager.f(), in milliseconds
	 */
	last_date: new Date,
	/**
	 * The recorded intervals of the last 100 executions. We sample from this to
	 * make a good guess at what the next interval should be.
	 */
	times: [],
	/**
	 * Factor by which to space out executions. 2 means double the measured interval.
	 */
	spacing: 0.8,
	/**
	 * Interval after which to execute the function TimerManager.f() next time it's run;
	 * changed every frame based on measured lag.
	 */
	interval: 10,
	/**
	 * Sets up TimerManager to run function f in context c every interval i;
	 * defaults to c of TimerManager and i of 10. You probably want to pass the scope
	 * of the function's parent class as c, as: TimerManager.setup(Foo.function_name,this)
	 * @param {Function} f The function to execute
	 * @param {Object} c The scope in which to run the function
	 * @param {Number} s The amount to space out function executions beyond measured interval. 
	 * 						2 means double the measured interval.
	 * @param {Number} i The interval at which to run the function
	 */
	setup: function(f,c,s,i) {
		this.f = f || function(){}
		this.context = c || this
		this.interval = i || this.interval
		setTimeout(this.bound_run,i || this.interval)
		// this.spacing = Math.max(1,2.5-Viewport.power())
	},
	/**
	 * Binds the scope of TimerManager.run() to TimerManager
	 */
	bound_run: function() {
		TimerManager.run.apply(TimerManager)
	},
	/**
	 * Records Dates for next interval measurement, runs TimerManager.f() with proper
	 * scope (TimerManager.context), creates a setTimeout to run itself again in 
	 * TimerManager.interval milliseconds.
	 */
	run: function() {
		var start_date = new Date
		this.f.apply(this.context)
		var execution_time = new Date - start_date
		this.times.unshift(parseInt(execution_time))
		if (this.times.length > 100) this.times.pop()
		setTimeout(this.bound_run,Math.max(50,parseInt(this.spacing*this.sample())))
	},
	/**
	 * Sampling pattern to make a best-guess at 
	 * what the next interval should be.
	 */
	sequence: [1,2,3,5,8,13],//,21,34,55],
	/**
	 * Samples from recorded intervals to make a best-guess at 
	 * what the next interval should be.
	 */
	sample: function() {
		var sample = 0
		for (var i = 0;i < this.sequence.length;i++) {
			sample += this.times[this.sequence[i]] || 0
		}
		return sample/9
	},
}
