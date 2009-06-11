Mushrooms = {
	initialize: function() {
		$('follow').observe('click', Mushrooms.follow)
		$('line').observe('click', Mushrooms.line)
		$('click').observe('click', Mushrooms.click)
		$('point').observe('click', Mushrooms.point)
	},
	follow: function() {
		User.toggle_following()
		$('follow').toggleClassName('pressed')
		return false
	},
	line: function() {
		$('line').toggleClassName('pressed')
		$('click').toggle()
		$('point').toggle()
		User.toggle_way_drawing()
		return false
	},
	click: function() {
		// should add mushroom to map
		User.submit_node()
		return false
	},
	point: function() {
		// should add point to line
		User.add_node()
		return false
	}
}
Event.observe(window, 'load', Mushrooms.initialize)

		