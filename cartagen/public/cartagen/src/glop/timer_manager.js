// TimerManager.setup(f)

// what if we close the laptop... 

var TimerManager = {
	last_date: new Date,
	lags: [],
	spacing: 2,
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
			// $l('> '+(new_date - this.last_date))
		var lag = Math.min(300,(((new_date - this.last_date) - this.interval) || 0))
		// $l(lag)
		this.last_date = new_date
		this.f()
		this.lags.unshift(lag)
		if (this.lags.length > 100) this.lags.pop()
		this.interval = this.sample()*this.spacing
			// $l(parseInt(this.sample())+';'+this.interval)
		setTimeout(this.bound_run,this.interval)
	},
	sample: function() {
		var sample = 0
		var sequence = [1,2,3,5,8,13,21,34,55]
		for (var i = 0;i < sequence.length;i++) {
			var add = this.lags[sequence[i]] || 0
			// add = Math.min(add,1000)
			sample += add
		}
		return sample/9
	},
}