/**
 * @namespace The 'Pen' tool and associated methods.
 */
Tool.Pen = {
	mousedown: function() {
		console.log('Pen mousedown')
	}.bindAsEventListener(Tool.Pen),
	mouseup: function() {
		console.log('Pen mouseup')
	}.bindAsEventListener(Tool.Pen),
	mousemove: function() {
		console.log('Pen mousemove')
	}.bindAsEventListener(Tool.Pen)
}
