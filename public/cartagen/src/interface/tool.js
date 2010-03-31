/**
 * @namespace A class to contain tool definitions and associated tool methods for user interaction.
 */
var Tool = {		
	initialize: function() {
		// default tool on startup is the Pan tool:
		Glop.observe('mousemove', Tool.Pan.mousemove)
		Glop.observe('mousedown', Tool.Pan.mousedown)
		Glop.observe('mouseup', Tool.Pan.mouseup)
		Glop.observe('dblclick', Tool.Pan.dblclick)
		Glop.observe('mouseover',this.mouse_in_main.bindAsEventListener(this))
		Glop.observe('mouseout',this.mouse_out_main.bindAsEventListener(this))
	},
	mouse_in_main: function() {
		Tool.hover = false
	},
	mouse_out_main: function() {
		Tool.hover = true
	},
	/**
	 * Whether the mouse is hovering over a tool button. Flag used to determine 
	 * whether user is clicking on a toolbar button and not trying to deselect
	 * an object. See example in Warper.mousedown()
	 */
	hover: true,
	/**
	 * The tool currently in use. Options include 'Pan', 'Pen', 'Select', 'Warp'
	 */
	active: 'Pan',
	/**
	 * Function to change the active tool 
	 */
	change: function(new_tool) {
		if (new_tool != Tool.active) {
			old_tool = Tool.active
			
			tool_events = ['mousemove','mouseup','mousedown','dblclick']

			tool_events.each(function(tool_event) {
				Glop.stopObserving(tool_event,Tool[old_tool][tool_event])
				Glop.observe(tool_event,Tool[new_tool][tool_event])
			})

			if (!Object.isUndefined(Tool[old_tool].deactivate)) {
				Tool[old_tool].deactivate()
			}
			if (!Object.isUndefined(Tool[new_tool].activate)) {
				Tool[new_tool].activate()
			}
			Tool.active = new_tool
		}
	},
	/**
	 * Pass drag call to the active tool:
	 */
	drag: function() {
		Tool[Tool.active].drag()
	},
}
