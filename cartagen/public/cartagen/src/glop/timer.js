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
	intervals: [],
	/**
	 * Factor by which to space out executions. 2 means double the measured interval.
	 */
	spacing: 1,
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
		this.f = f || Prototype.emptyFunction
		this.context = c || this
		this.interval = i || this.interval
		setTimeout(this.bound_run,i || this.interval)
		// this.spacing = s || Math.max(0,2.5-Viewport.power())
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
		var new_date = new Date
		// don't let measured_interval drop below 10:
		var measured_interval = Math.max(((new_date - this.last_date) - this.interval),10)
		this.last_date = new_date
		this.f.apply(this.context)
		this.intervals.unshift(parseInt(measured_interval))
		if (this.intervals.length > 100) this.intervals.pop()
		this.interval = this.sample()*this.spacing
		setTimeout(this.bound_run,this.interval)
	},
	/**
	 * Samples from recorded intervals to make a best-guess at 
	 * what the next interval should be.
	 */
	sample: function() {
		var sample = 0
		var sequence = [1,2,3,5,8,13,21,34,55]
		for (var i = 0;i < sequence.length;i++) {
			sample += this.intervals[sequence[i]] || 0
		}
		return sample/9
	},
}