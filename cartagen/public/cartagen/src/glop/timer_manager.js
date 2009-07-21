/**
 * @namespace Manages CPU usage by running main loop process,
 * monitoring loop completion, and adjusting interval to compensate.
 */
var TimerManager = {
	/**
	 * Date of last execution
	 */
	last_date: new Date,
	/**
	 * Intervals of last 100 executions. 
	 */
	intervals: [],
	/**
	 * Factor by which to space out executions. 2 means run them 
	 */
	spacing: 3,
	interval: 10,
	setup: function(f,i) {
		this.f = f || Prototype.emptyFunction
		this.interval = i || this.interval
		setTimeout(this.bound_run,i || this.interval)
	},
	bound_run: function() {
		TimerManager.run.apply(TimerManager)
	},
	run: function() {
		var new_date = new Date
		// var lag = Math.min(300,(((new_date - this.last_date) - this.interval) || 0))
		var measured_interval = ((new_date - this.last_date) - this.interval)
		measured_interval = Math.max(measured_interval,10)
		this.last_date = new_date
		this.f()
		this.intervals.unshift(parseInt(measured_interval))
		if (this.intervals.length > 100) this.intervals.pop()
		this.interval = this.sample()*this.spacing
		setTimeout(this.bound_run,this.interval)
	},
	sample: function() {
		var sample = 0
		var sequence = [1,2,3,5,8,13,21,34,55]
		for (var i = 0;i < sequence.length;i++) {
			var add = this.intervals[sequence[i]] || 0
			// add = Math.min(add,1000)
			sample += add
		}
		return sample/9
	},
}