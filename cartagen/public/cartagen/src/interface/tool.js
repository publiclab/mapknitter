/**
 * @namespace A class to contain tool definitions and associated tool methods for user interaction.
 */
var Tool = {			
	initialize: function() {
		// default tool on startup is the Pan tool:
		Glop.observe('mousemove', Tool.Pan.mousemove)
		Glop.observe('mousedown', Tool.Pan.mousedown)
		Glop.observe('mouseup', Tool.Pan.mouseup)
	},
	/**
	 * The tool currently in use. Options include 'pan', 'pen', 'select'
	 */
	active: 'Pan',
	/**
	 * Function to change the active tool 
	 */
	change: function(new_tool) {
		old_tool = Tool.active
			
		tool_events = ['mousemove','mouseup','mousedown']

		tool_events.each(function(tool_event) {
			Glop.stopObserving(tool_event,Tool[old_tool][tool_event])
			Glop.observe(tool_event,Tool[new_tool][tool_event])
		})

		Tool.active = new_tool
	},
	/*
	 * Pass drag call to the active tool:
	 */
	drag: function() {
		Tool[Tool.active].drag()
	}
}
