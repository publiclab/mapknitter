/**
 * Manages long-running tasks; breaks them up to avoid stalling the UI;
 * uses Web Workers where available.
 * @class
 */
var TaskManager = Class.create(
/**
 * @lends TaskManager#
 */
{
	initialize: function(quota, tasks) {
		/**
		 * Amount of time, in miliseconds, allocated to the TaskManager each frame.
		 */
		this.quota = quota
		
		/**
		 * Tasks to be performed; each is a Task object with members
		 */
		this.tasks = tasks || []
		
		// This could support Web Workers
		//this.workers = []
		
		this.listener = this.run.bindAsEventListener(this)
		
		this.completed = 0
		
		this.start()
	},
	/**
	 * Tasks to be performed; each is a Task object with members
	 */ 
	run: function() {
		var i = 0
		var start_time = new Date().getTime()
		var cur_tasks = []
		var r, task
		
		for (var j = 0; j < this.tasks.length; j++) {
			if (this.tasks[j].pass_condition()) {
				cur_tasks.push(this.tasks[j])
			}
		}
		
		while (cur_tasks.length > 0 && (new Date().getTime() - start_time) < this.quota) {
			task = cur_tasks[(i++) % cur_tasks.length]
			r = task.exec_next()
			if (r === false) {
				this.tasks = this.tasks.without(task)
				cur_tasks = cur_tasks.without(task)
			}
		}
		
		this.get_completed(cur_tasks)
		
		Geohash.get_objects()
		Glop.trigger_draw()
		
		if (this.tasks.length < 1) this.stop()
	},
	add: function(task) {
		this.tasks.push(task)
		
		if (!this.active) this.start()
	},
	start: function() {
		this.active = true
		Glop.observe('glop:predraw', this.listener)
	},
	stop: function() {
		this.active = false
		Glop.stopObserving('glop:predraw', this.listener)
	},
	get_completed: function(tasks) {
		var total = 0
		var left = 0
		for (var i = 0; i < tasks.length; ++i) {
			total += tasks[i].total_members
			left += tasks[i].members.length
		}
		this.completed = ((total-left)/total) * 100
	}
})

/**
 * Contains a single task made up of a list of members to be
 * processed and a process() function to apply to them
 * @class
 */
var Task = Class.create(
/**
 * @lends Task#
 */
{
	initialize: function(members, process, condition, deps) {
		/**
		 * A list of values upon which to perform the "process" function
		 * @type Object[]
		 */ 
		this.members = members || []
		this.total_members = members.length || 0
		/**
		 * A function to process objects with
		 * @type Function
		 */
		this.process = process || Prototype.emptyFunction
		/**
		 * A function or boolean that determines whther the task should be run.
		 * @type Function | Boolean
		 */
		if (Object.isUndefined(condition)) condition = true
		this.condition = condition
	
		Task.register(this)
		/**
		 *  Dependencies of this task.
		 *  If it has uncompleted deps, it does not run.
		 */
		this.deps = deps || []
	},
	exec_next: function() {
		if (!this.should_run()) return true
		
		this.process(this.members.shift())
		
		if (this.members.length > 0) return true
		else {
			Task.complete(this.id)
			return false
		}
	},
	should_run: function() {
		if (!this.pass_condition) return false
		
		for (var i = 0; i < this.deps.length; i++) {
			if (Task.is_done(this.deps[i]) === false) {
				return false
			}
		}
		
		return true
	},
	pass_condition: function() {
		if (Object.value(this.condition, this) === false) return false
		
		return true
	},

	// Currently unused
	
	/**
	 * Whether this task's progress bar is visible by default.
	 */ 
	visible: false,
	/**
	 * Displays a progress bar for % of members processed
	 */ 
	display: function() {
		if (this.visible || Config.debug) {
			// display a 
		}
	}
})

Task.cur_uid = 1
Task.registry = {}
Task.register = function(task) {
	task.id = Task.cur_uid++
	Task.registry[task.id] = false
}
Task.complete = function(id) {
	Task.registry[id] = true
}
Task.is_done = function(id) {
	return Task.registry[id]
}


// Not currently used

/**
 * Representation of a single timer, which tracks
 * how far behind it's expected interval is.
 * @class
 */
var Timer = Class.create(
/**
 * @lends Timer#
 */
{
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
	lag: 0
})

/*
TaskTest = {
	a: $R(1, 10).toArray(),
	b: $R(1, 10).toArray(),
	c: $R(1, 10).toArray(),
	d: $R(1, 10).toArray(),
	a2: [],
	b2: [],
	c2: [],
	d2: [],
	fa: function(o) {
		for (var i=0; i<9999999; i++){}
		TaskTest.a2.push(o)
	},	
	fb: function(o) {
		for (var i=0; i<9999999; i++){}
		TaskTest.b2.push(o)
	},	
	fc: function(o) {
		for (var i=0; i<9999999; i++){}
		TaskTest.c2.push(o)
	},
	fd: function(o) {
		for (var i=0; i<9999999; i++){}
		TaskTest.d2.push(o)
	}
}

function tt_init() {
	TaskTest.ta = new Task(TaskTest.a, TaskTest.fa, true),
	TaskTest.tb = new Task(TaskTest.b, TaskTest.fb, true, [TaskTest.ta.id]),
	TaskTest.tc = new Task(TaskTest.c, TaskTest.fc, true, [TaskTest.tb.id]),
	TaskTest.td = new Task(TaskTest.d, TaskTest.fd, true, [TaskTest.tb.id]),
	TaskTest.tm = new TaskManager(1000, [TaskTest.ta, TaskTest.tb, TaskTest.tc, TaskTest.td])
}
*/
