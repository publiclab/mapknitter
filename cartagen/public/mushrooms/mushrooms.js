Mushrooms = {
	initialize: function() {
		$('follow').observe('click', Mushrooms.follow)
		$('line').observe('click', Mushrooms.line)
		$('click').observe('click', Mushrooms.click)
		$('point').observe('click', Mushrooms.point)
	},
	follow: function() {
		// should toggle user following
		alert('following')
		return false
	},
	line: function() {
		// should toggle line drawing
		$('line').toggleClassName('pressed')
		$('click').toggle()
		$('point').toggle()
		return false
	},
	click: function() {
		// should add mushroom to map
		alert('clicked')
		return false
	},
	point: function() {
		// should add point to line
		alert('pointed')
		return false
	}
}
Event.observe(window, 'load', Mushrooms.initialize)

		