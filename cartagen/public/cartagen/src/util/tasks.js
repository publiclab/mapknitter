/**
 * @namespace Manages long-running tasks; breaks them up to avoid stalling the UI;
 * uses Web Workers where available.
 */
var TaskManager = Class.create({
	initialize: function(tasks) {
		/**
		 * Tasks to be performed; each is a Task object with members
		 */
		this.tasks = tasks || []
		
		/**
		 * Where applicable, an array of Web Workers (HTML5) to pass tasks to
		 */
		this.timers = [10] //[10,20,40,80]
		
		this.workers = []
	},
	/**
	 * Tasks to be performed; each is a Task object with members
	 */ 
	run: function() {
		this.tasks.each(function() {
			// ############ check against our timers and perform:
			
		})
	},
	add: function(task) {
		this.tasks.push(task)
	},
	display: function() {
		this.tasks.each(function(task,index) {
			// move to top left, display a row of processes as either bars or pies:
			
		})
	}
})

/**
 * @namespace Contains a single task made up of a list of members to be
 * processed and a process() function to apply to them
 */
var Task = Class.create({
	initialize: function(members,process,per_frame) {
		this.members = members || []
		this.process = process || Prototype.emptyFunction
		this.per_frame = per_frame || 40
	},
	/**
	 * A list of values upon which to perform the function, as: 'member.process()'
	 */ 
	members: [],
	/**
	 * function to apply to each member
	 */ 
	process: function() {},
	/**
	 * Expected # of task members to be completed per frame. 
	 */ 
	per_frame: 40,
	/**
	 * Whether this task's progress bar is visible by default.
	 */ 
	visible: false,
	/**
	 * Displays a progress bar for % of members processed
	 */ 
	display: function() {
		if (this.visible || Cartagen.debug) {
			// display a 
		}
	},
	/**
	 * If expire is nonzero, then if it's more than Task.expire
	 * frames old, the task is discarded.
	 */ 
	condition: function() {
		
	},
})

/**
 * @namespace Representation of a single timer, which tracks
 * how far behind it's expected interval is.
 */
var Timer = {
	initialize: function(interval,units) {
		if (units == 'seconds') {
			// ############ translate
		} else if (!Object.isUndefined(interval)) this.interval = interval
	},
	/**
	 * Interval of timer 
	 */ 
	interval: 40,
	/**
	 * Tracks how far behind projected timer completion we are
	 */ 
	lag: 0,
}