var TimerManager = {
	date: new Date,
	setup: function(f,i) {
		this.f = f || Prototype.emptyFunction
		setTimeout(this.f,i || 10)
	},
	run: function() {
		var new_date = new Date
		var lag = new_date - this.last_date
		this.last_date = new_date
		this.history.unshift(lag)
		
		this.interval = this.sample()
		setTimeout(this.f,this.interval)
	},
	sample: function() {
		var sample = 0
		sample += this.history[1] || 0
		sample += this.history[2] || 0
		sample += this.history[3] || 0
		sample += this.history[5] || 0
		sample += this.history[8] || 0
		sample += this.history[13] || 0
		sample += this.history[21] || 0
		sample += this.history[34] || 0
		sample += this.history[55] || 0
		return sample/9
	},
	history: [],
}
// TimerManager.setup(f)