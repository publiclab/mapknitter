/**
 * @namespace Canvas functions, wrapped into shorter, simpler names and abstracted for cross-browser
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
		$('canvas').style.position = 'relative'
		$('main').style.position = 'absolute'
		$('main').style.top = 0
		$('main').style.left = 0
		this.canvas =  $('main').getContext('2d')
		this.element = $('main')
		this.canvases.set('main',this.canvas)
		CanvasTextFunctions.enable(this.canvas)
	},
	/**
	 * Current Glop canvas name.
	 */
	current: 'main',
	/**
	 * Glop initializes with only 1 canvas but you can add more;
	 * they're stored here.
	 */
	canvases: new Hash,
	/**
	 * You can 'freeze' a canvas so that draw commands to it are ignored.
	 */
	freezer: new Hash,
	/**
	 * This marks whether the current canvas is frozen.
	 */
	frozen: false,
	/**
	 * Freezes a named canvas - won't allow it to be drawn to.
	 */
	freeze: function(name) {
		// if ($C.freezer.get(name) != true) {
		// 	$l('freezing '+name)
		// 	$C.freezer.set(name,true)
		// 	if ($C.current == name) $C.frozen = true
		// }
	},
	/**
	 * Allows named canvas to be drawn to.
	 */
	thaw: function(name) {
		// $l('thawing '+name)
		// $C.freezer.unset(name)
		// if ($C.current == name) $C.frozen = false
	},
	/**
	 * To add a new canvas element. For now, added to the bottom of the
	 * body element
	 * @param {String} name The name of the new layer
	 */
	add: function(name) {
		$('canvas').insert({top:'<canvas style="position:absolute;top:0;left:0" id="'+name+'" ></canvas>'})
		var new_canvas = $(name).getContext('2d')
		$C.canvases.set(name,new_canvas)
	},
	/**
	 * Open a different canvas to draw to. If called without a parameter,
	 * opens the main canvas.
	 * @param {String} name The name of the canvas to draw to by default
	 */
	open: function(name) {
		// name = name || 'main'
		// $C.current = name
		// if ($C.freezer.get(name)) $C.frozen = true
		// else $C.frozen = false
		// // $l('opening '+name+' canvas')
		// this.element = $(name)
		// $C.canvas = $C.canvases.get(name)
	},
	close: function() {
		// $C.current = 'main'
		// this.element = $('main')
		// if ($C.freezer.get('main')) $C.frozen = true
		// $C.canvas = $C.canvases.get('main')
	},
	/**
	 * Clears the canvas; if 'name' is supplied, clears the canvas with name 'name'
	 */
	clear: function(name){
		// if ($C.frozen) return
		name = name || 'main'
		$C.canvases.get(name).clearRect(0, 0, Glop.width, Glop.height)
	},	
	/**
	 * Sets canvas.fillStyle
	 * @param {String} color Color to use for future fill operations
	 */
	fill_style: function(color) {
		// if ($C.frozen) return
		$C.canvas.fillStyle = color
	},
	/**
	 * Sets the fill style of the canvas to a pattern.
	 * @param {Image}  image  Image to use for pattern
	 * @param {String} repeat How to repeat pattern - "repeat", "repeat-x", "repeat-y", or
	 *                        "no-repeat"
	 */
	fill_pattern: function(image, repeat) {
		// if ($C.frozen) return
		// this seems to often fail, so wrapped in a try:
		// try/fail is inefficient, removed:
		// try { 
		if (image.width) {
			$C.canvas.fillStyle = $C.canvas.createPattern(image, repeat)
		}
		// } catch(e) {}
	},
	/**
	 * Draws an image at x,y
	 * @param {Image}  image  Image to display: a JavaScript Image object. 
	 * 							Can also accept a Canvas element, but check Canvas docs.
	 * @param {Number} x coordinate at which to display image
	 * @param {Number} y coordinate at which to display image
	 */
	draw_image: function(image, x,y) {
		// if ($C.frozen) return
		// this seems to often fail, so wrapped in a try:
		// try/fail is inefficient, removed:
		// try { 
			$C.canvas.drawImage(image, x, y) 
		// } catch(e) {$l(e)}
	},
	/**
	 * Alias of canvas.translate
	 * @param {Number} x Number of pixels to tranlate in the x direction
	 * @param {Number} y Number of pixels to tranlate in the y direction
	 */
	translate: function(x,y) {
		// if ($C.frozen) return
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
		// if ($C.frozen) return
		$C.canvas.scale(x,y)
	},
	
	/**
	 * Alias of canvas.rotate
	 * @param {Number} rotation Amount, in radians, to rotate
	 */
	rotate: function(rotation){
		// if ($C.frozen) return
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
		// if ($C.frozen) return
		$C.canvas.fillRect(x, y, w, h)
	},
	
	circ: function(x, y, r){
		// if ($C.frozen) return
		$C.canvas.beginPath()
		$C.canvas.arc(x, y, r, 0, 2*Math.PI, true)
		$C.canvas.fill()
	},
	
	/**
	 * Alias of canvas.strokeRect (unfilled rectangle)
	 * @param {Number} x X-coord of the top-left corner
	 * @param {Number} y Y-coord of the top-left corner
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle

	 */
	stroke_rect: function(x, y, w, h){
		// if ($C.frozen) return
		$C.canvas.strokeRect(x, y, w, h)
	},
	
	/**
	 * Alias of canvas.strokeStyle
	 * @param {String} color Color to use for future stroke operations
	 */
	stroke_style: function(color) {
		// if ($C.frozen) return
		$C.canvas.strokeStyle = color
	},
	
	/**
	 * Sets how succesive lines are joined.
	 * @param {String} style Style string - 'round', 'bevel', or 'miter'
	 */
	line_join: function(style) {
		// if ($C.frozen) return
		$C.canvas.lineJoin = style
	},
	
	/**
	 * Sets how the end of a line is styled.
	 * @param {String} style Style string - 'round', 'butt', or 'square'
	 */
	line_cap: function(style) {
		// if ($C.frozen) return
		$C.canvas.lineCap = style
	},
	
	/**
	 * Sets canvas.lineWidth
	 * @param {Number} lineWidth New width, in pixels, to use for stroke
	 *                           operations
	 */
	line_width: function(lineWidth){
		// if ($C.frozen) return
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
		// if ($C.frozen) return
		$C.canvas.beginPath()
	},
	
	/**
	 * Alias of canvas.moveTo
	 * @param {Number} x X-coord of location to move to
	 * @param {Number} y Y-coord of location to move to
	 */
	move_to: function(x, y){
		// if ($C.frozen) return
		$C.canvas.moveTo(x, y)
	},
	
	/**
	 * Alias of canvas.lineTo
	 * @param {Number} x X-coord of location to draw line to
	 * @param {Number} y Y-coord of location to draw line to
	 */
	line_to: function(x, y){
		// if ($C.frozen) return
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
		// if ($C.frozen) return
		$C.canvas.quadraticCurveTo(cp_x, cp_y, x, y)
	},
	
	/**
	 * Draws a stroke along the current path.
	 * @function
	 */
	stroke: function(){
		// if ($C.frozen) return
		$C.canvas.stroke()
	},
	
	/**
	 * Draws an outlined (dotted, outlined, etc) stroke along the current path.
	 * @function
	 */
	outline: function(color,width){
		// if ($C.frozen) return
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
		// if ($C.frozen) return
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
		// if ($C.frozen) return
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
		// if ($C.frozen) return
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
		// if ($C.frozen) return
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
		// if ($C.frozen) return
		$C.canvas.globalAlpha = alpha
	},
	/**
	 * Saves the state of the canvas
	 * @see $C.restore
	 */
	save: function() {
		// if ($C.frozen) return
		$C.canvas.save()
	},
	/**
	 * Restores the canvas its last saved state.
	 * @see $C.save
	 */
	restore: function() {
		// if ($C.frozen) return
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
