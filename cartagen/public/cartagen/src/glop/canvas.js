// Wrapped native canvas methods in shorter, simpler method names:

/**
 * Initializes the $C namespace
 */
function canvas_init(){
	/**
	 * @namespace
	 * Cavas functions, wapped into shorter, simpler names.
	 * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes>MDC Docs</a>
	 */
	$C = {
		/**
		 * Clears the canvas
		 */
		clear: function(){
			canvas.clearRect(0, 0, width, height)
		},
		
		/**
		 * Sets canvas.fillStyle
		 * @param {String} color Color to use for future fill operations
		 */
		fill_style: function(color) {
			canvas.fillStyle = color
		},
		
		/**
		 * Alias of canvas.translate
		 * @param {Number} x Number of pixels to tranlate in the x direction
		 * @param {Number} y Number of pixels to tranlate in the y direction
		 */
		translate: function(x,y) {
			canvas.translate(x,y)
		},
		
		/**
		 * Alias of canvas.scale
		 * @param {Number} x Number of pixels to stretch/shring in the x direction
		 * @param {Number} y Number of pixels to stretch/shring in the y direction
		 */
		scale: function(x,y) {
			canvas.scale(x,y)
		},
		
		/**
		 * Alias of canvas.rotate
		 * @param {Number} rotation Amount, in radians, to rotate
		 */
		rotate: function(rotation){
			canvas.rotate(rotation)
		},
		
		/**
		 * Alias of canvas.fillRect (filled rectangle)
		 * @param {Number} x X-coord of the top-left corner
		 * @param {Number} y Y-coord of the top-left corner
		 * @param {Number} w Width of the rectangle
		 * @param {Number} h Height of the rectangle
		 */
		rect: function(x, y, w, h){
			canvas.fillRect(x, y, w, h)
		},
		
		/**
		 * Alias of canvas.strokeRect (unfilled rectangle
		 * @param {Number} x X-coord of the top-left corner
		 * @param {Number} y Y-coord of the top-left corner
		 * @param {Number} w Width of the rectangle
		 * @param {Number} h Height of the rectangle

		 */
		stroke_rect: function(x, y, w, h){
			canvas.strokeRect(x, y, w, h)
		},
		
		/**
		 * Alias of canvas.strokeStyle
		 * @param {String} color Color to use for future stroke operations
		 */
		stroke_style: function(color) {
			canvas.strokeStyle = color
		},
		
		/**
		 * Sets canvas.lineWidth
		 * @param {Number} lineWidth New width, in pixels, to use for stroke operations
		 */
		line_width: function(lineWidth){
			if (parseInt(lineWidth) == 0) 
				canvas.lineWidth = 0.0000000001
			else 
				canvas.lineWidth = lineWidth
		},
		
		/**
		 * Alias of canvas.beginPath
		 */
		begin_path: function(){
			canvas.beginPath()
		},
		
		/**
		 * Alias of canvas.moveTo
		 * @param {Number} x X-coord of location to move to
		 * @param {Number} y Y-coord of location to move to
		 */
		move_to: function(x, y){
			canvas.moveTo(x, y)
		},
		
		/**
		 * Alias of canvas.lineTo
		 * @param {Number} x X-coord of location to draw line to
		 * @param {Number} y Y-coord of location to draw line to
		 */
		line_to: function(x, y){
			canvas.lineTo(x, y)
		},
		
		/**
		 * Draws a quadratic curve
		 * @param {Number} cp_x X-coord of control point
		 * @param {Number} cp_y Y-coord of control point
		 * @param {Number} x    X-coord of point to draw to
		 * @param {Number} y    Y-coord of point to draw to
		 * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves">MDC Docs</a>
		 * @function
		 */
		quadratic_curve_to: function(cp_x, cp_y, x, y){
			canvas.quadraticCurveTo(cp_x, cp_y, x, y)
		},
		
		/**
		 * Draws a stroke along the current path.
		 * @function
		 */
		stroke: function(){
			canvas.stroke()
		},
		
		/**
		 * Closes the current path, then fills it.
		 */
		fill: function(){
			canvas.fill()
		},
		
		/**
		 * Draws an arc
		 * @param {Number} x                   X-coord of circle's center
		 * @param {Number} y                   Y-coord of circle's center
		 * @param {Number} radius              Radius of circle
		 * @param {Number} startAngle          Angle, in radians, from the +x axis to start the arc from
		 * @param {Number} endAngle            Angle, in radians, from the +x axis to end the arc at
		 * @param {Boolean} [counterclockwise] If true, arc is drawn counterclockwise. Else, it is drawn clockwise
		 */
		arc: function(x, y, radius, startAngle, endAngle, counterclockwise){
			canvas.arc(x, y, radius, startAngle, endAngle, counterclockwise)
		},
		
		/**
		 * Draws text on the canvas
		 * @param {String} font Font to use
		 * @param {Number} size Size, in pts, of text
		 * @param {Number} x    X-coord to start drawing at
		 * @param {Number} y    Y-coord to start drawing at
		 * @param {String} text Text to draw
		 */
		draw_text: function(font, size, x, y, text){
			canvas.drawText(font, size, x, y, text)
		},
		
		/**
		 * Draws text on canvas, with location specified as a center point
		 * @param {String} font Font to use
		 * @param {Number} size Size, in pts, of text
		 * @param {Number} x    X-coord to center text on
		 * @param {Number} y    Y-coord to center text on
		 * @param {String} text Text to draw
		 */
		draw_text_center: function(font, size, x, y, text){
			canvas.drawTextCenter(font, size, x, y, text)
		}
	}
}