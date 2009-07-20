var TimerManager = {
	last_date: new Date,
	lags: [],
	setup: function(f,i) {
		this.f = f || Prototype.emptyFunction
		setTimeout(this.bound_run,i || 10)
	},
	bound_run: function() {
		TimerManager.run.apply(TimerManager)
	},
	run: function() {
		var new_date = new Date
		var lag = new_date - this.last_date
		this.last_date = new_date
		this.lags.unshift(lag)
		if (this.lags.length > 100) this.lags.pop()
		this.f()
		this.interval = this.sample()
		setTimeout(this.bound_run,this.interval)
	},
	sample: function() {
		var sample = 0
		sample += this.lags[1] || 0
		sample += this.lags[2] || 0
		sample += this.lags[3] || 0
		sample += this.lags[5] || 0
		sample += this.lags[8] || 0
		sample += this.lags[13] || 0
		sample += this.lags[21] || 0
		sample += this.lags[34] || 0
		sample += this.lags[55] || 0
		return sample/9
	},
}
// TimerManager.setup(f)