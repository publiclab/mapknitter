/**
 * @namespace Cavas functions, wapped into shorter, simpler names and abstracted for cross-browser
 *            compatability
 * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes>
 *      MDC Docs</a>
 */
$C = {
	/**
	 * Loads the canvas and its rendering context.
	 */
	init: function() {
		/**
		 * The 2d rendering context of the canvas
		 * @type CanvasRenderingContext2D
		 */
		this.canvas =  $('canvas').getContext('2d')
		CanvasTextFunctions.enable(this.canvas)
	},
	/**
	 * Clears the canvas
	 */
	clear: function(){
		$C.canvas.clearRect(0, 0, Glop.width, Glop.height)
	},
	
	/**
	 * Sets canvas.fillStyle
	 * @param {String} color Color to use for future fill operations
	 */
	fill_style: function(color) {
		$C.canvas.fillStyle = color
	},
	/**
	 * Sets the fill style of the canvas to a pattern.
	 * @param {Image}  image  Image to use for pattern
	 * @param {String} repeat How to repeat pattern - "repeat", "repeat-x", "repeat-y", or
	 *                        "no-repeat"
	 */
	fill_pattern: function(image, repeat) {
		// this seems to often fail, so wrapped in a try:
		try { $C.canvas.fillStyle = $C.canvas.createPattern(image, repeat) } catch(e) {}
	},
	/**
	 * Draws an image at x,y
	 * @param {Image}  image  Image to display: a JavaScript Image object. 
	 * 							Can also accept a Canvas element, but check Canvas docs.
	 * @param {Number} x coordinate at which to display image
	 * @param {Number} y coordinate at which to display image
	 */
	draw_image: function(image, x,y) {
		// this seems to often fail, so wrapped in a try:
		try { $C.canvas.drawImage(image, x, y) } catch(e) {$l(e)}
	},
	/**
	 * Alias of canvas.translate
	 * @param {Number} x Number of pixels to tranlate in the x direction
	 * @param {Number} y Number of pixels to tranlate in the y direction
	 */
	translate: function(x,y) {
		$C.canvas.translate(x,y)
	},
	
	/**
	 * Alias of canvas.scale
	 * @param {Number} x Number of pixels to stretch/shring in the x 
	 *                   direction
	 * @param {Number} y Number of pixels to stretch/shring in the y 
	 *                   direction
	 */
	scale: function(x,y) {
		$C.canvas.scale(x,y)
	},
	
	/**
	 * Alias of canvas.rotate
	 * @param {Number} rotation Amount, in radians, to rotate
	 */
	rotate: function(rotation){
		$C.canvas.rotate(rotation)
	},
	
	/**
	 * Alias of canvas.fillRect (filled rectangle)
	 * @param {Number} x X-coord of the top-left corner
	 * @param {Number} y Y-coord of the top-left corner
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 */
	rect: function(x, y, w, h){
		$C.canvas.fillRect(x, y, w, h)
	},
	
	/**
	 * Alias of canvas.strokeRect (unfilled rectangle)
	 * @param {Number} x X-coord of the top-left corner
	 * @param {Number} y Y-coord of the top-left corner
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle

	 */
	stroke_rect: function(x, y, w, h){
		$C.canvas.strokeRect(x, y, w, h)
	},
	
	/**
	 * Alias of canvas.strokeStyle
	 * @param {String} color Color to use for future stroke operations
	 */
	stroke_style: function(color) {
		$C.canvas.strokeStyle = color
	},
	
	/**
	 * Sets how succesive lines are joined.
	 * @param {String} style Style string - 'round', 'bevel', or 'miter'
	 */
	line_join: function(style) {
		$C.canvas.lineJoin = style
	},
	
	/**
	 * Sets how the end of a line is styled.
	 * @param {String} style Style string - 'round', 'butt', or 'square'
	 */
	line_cap: function(style) {
		$C.canvas.lineCap = style
	},
	
	/**
	 * Sets canvas.lineWidth
	 * @param {Number} lineWidth New width, in pixels, to use for stroke
	 *                           operations
	 */
	line_width: function(lineWidth){
		if (parseInt(lineWidth) == 0) {
			$C.canvas.lineWidth = 0.000000001	
		} else {
			$C.canvas.lineWidth = lineWidth
		}
	},
	
	/**
	 * Alias of canvas.beginPath
	 */
	begin_path: function(){
		$C.canvas.beginPath()
	},
	
	/**
	 * Alias of canvas.moveTo
	 * @param {Number} x X-coord of location to move to
	 * @param {Number} y Y-coord of location to move to
	 */
	move_to: function(x, y){
		$C.canvas.moveTo(x, y)
	},
	
	/**
	 * Alias of canvas.lineTo
	 * @param {Number} x X-coord of location to draw line to
	 * @param {Number} y Y-coord of location to draw line to
	 */
	line_to: function(x, y){
		$C.canvas.lineTo(x, y)
	},
	
	/**
	 * Draws a quadratic curve
	 * @param {Number} cp_x X-coord of control point
	 * @param {Number} cp_y Y-coord of control point
	 * @param {Number} x    X-coord of point to draw to
	 * @param {Number} y    Y-coord of point to draw to
	 * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves">
	 *      MDC Docs</a>
	 * @function
	 */
	quadratic_curve_to: function(cp_x, cp_y, x, y){
		$C.canvas.quadraticCurveTo(cp_x, cp_y, x, y)
	},
	
	/**
	 * Draws a stroke along the current path.
	 * @function
	 */
	stroke: function(){
		$C.canvas.stroke()
	},
	
	/**
	 * Draws an outlined (dotted, outlined, etc) stroke along the current path.
	 * @function
	 */
	outline: function(color,width){
		$C.save()
		// this should eventually inherit from the master default styles
			$C.stroke_style(color)
			$C.line_width($C.canvas.lineWidth+(width*2))
		$C.canvas.stroke()
		$C.restore()
		$C.canvas.stroke()
	},
	
	/**
	 * Closes the current path, then fills it.
	 */
	fill: function(){
		$C.canvas.fill()
	},
	
	/**
	 * Draws an arc
	 * @param {Number} x                   X-coord of circle's center
	 * @param {Number} y                   Y-coord of circle's center
	 * @param {Number} radius              Radius of circle
	 * @param {Number} startAngle          Angle, in radians, from the +x axis to start the arc
	 *                                     from
	 * @param {Number} endAngle            Angle, in radians, from the +x axis to end the arc 
	 *                                     at
	 * @param {Boolean} [counterclockwise] If true, arc is drawn counterclockwise. Else, it is
	 *                                     drawn clockwise
	 */
	arc: function(x, y, radius, startAngle, endAngle, counterclockwise){
		$C.canvas.arc(x, y, radius, startAngle, endAngle, counterclockwise)
	},
	/**
	 * Draws text on the canvas. Fonts are not supported in all
	 * broswers.
	 * @param {String} font Font to use
	 * @param {Number} size Size, in pts, of text
	 * @param {Number} x    X-coord to start drawing at
	 * @param {Number} y    Y-coord to start drawing at
	 * @param {String} text Text to draw
	 */
	draw_text: function(font, size, color, x, y, text){
		if ($C.canvas.fillText) {
			$C.canvas.fillStyle = color
			$C.canvas.font = size+'pt ' + font
			$C.canvas.fillText(text, x, y)
		} else {
			$C.canvas.strokeStyle = color
			$C.canvas.drawText(font, size, x, y, text)
		}
	},
	/**
	 * Measures the width, in pixels, that the text will be
	 * @param {Object} font Font that will be drawn with
	 * @param {Object} size Size, in pts, of text
	 * @param {Object} text Text to be measured
	 */
	measure_text: function(font, size, text) {
		if ($C.canvas.fillText) {
			$C.canvas.font = size + 'pt ' + font
			var width = $C.canvas.measureText(text)
			// some browsers return TextMetrics
			if (width.width) return width.width
			return width
		}
		else {
			return $C.canvas.measureCanvasText(font, size, text)
		}


	},
	/**
	 * Sets the canvas' globalAlpha.
	 * @param {Number} alpha New alpha value, between 0 and 1.
	 */
	opacity: function(alpha) {
		$C.canvas.globalAlpha = alpha
	},
	/**
	 * Saves the state of the canvas
	 * @see $C.restore
	 */
	save: function() {
		$C.canvas.save()
	},
	/**
	 * Restores the canvas its last saved state.
	 * @see $C.save
	 */
	restore: function() {
		$C.canvas.restore()
	},
	/**
	 * Return a url that contains all the data in the canvas. Essentially,
	 * it is a link to an image of the canvas.
	 * @return Data url
	 * @type String
	 */
	to_data_url: function() {
		return $C.canvas.canvas.toDataURL()
	},
	/**
	 * Identical to to_data_url, but produces an image much larger than the screen, for print quality
	 * @param {Number} width Width of resulting image in pixels
	 * @param {Number} height Height of resulting image in pixels
	 * @return Data url
	 * @type String
	 */
	to_print_data_url: function(width,height) {
		var _height = Glop.height, _width = Glop.width
		Glop.width = width
		Glop.height = height
		Glop.draw(true) // with a custom size
		var url = $C.canvas.canvas.toDataURL()
		Glop.width = _width
		Glop.height = _height
		return url
	}
}

document.observe('cartagen:init', $C.init.bindAsEventListener($C))
