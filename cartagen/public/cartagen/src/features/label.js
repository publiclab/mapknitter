/**
 * Represents a label for a Feature.
 * @class
 */
var Label = Class.create(
/**
 * @lends Label#
 */
{
	/**
	 * Sets the default label properties and owner.
	 * @param {Feature} owner
	 * @constructs
	 */
    initialize: function(owner) {
		/**
		 * Font to use if native canvas text is supported
		 * @type String
		 */
		this.fontFamily = 'Lucida Grande',
		/**
		 * Font size, in pts.
		 * @type Number
		 */
	    this.fontSize = 11,
		/**
		 * Background color for label. Set to null for no label background.
		 * @type String
		 */
	    this.fontBackground = null,
		/**
		 * Text to place on label. Set to null to not draw label.
		 * @type String
		 */
	    this.text = null,
		/**
		 * Set to "fixed" to not scale label based on zoom level
		 * @type String
		 */
	    this.fontScale = false,
		/**
		 * Distance, in pixels, between edge of label and text
		 * @type Number
		 */
	    this.padding = 6,
		/**
		 * Color of the text
		 * @type String
		 */
	    this.fontColor = '#eee',
		/**
		 * Angle, in radians (relative to the +x axis), to rotate this label by.
		 * Set to "fixed" to rotate with the map.
		 * @type Number | String
		 */
		this.fontRotation = 0,
		/**
		 * The parent feature that this label belongs to
		 * @type Feature
		 */
        this.owner = owner
    },
	/**
	 * Draws this label at the specified position
	 * @param {Number} x
	 * @param {Number} y
	 */
    draw: function(x, y) {
        if (this.text) {
			$l('drawing label w/ text: ' + this.text + ' at (' + x + ',' + y + ')')
            $C.save()

            Style.apply_font_style(this)

			//rotate the labels on unclosed ways:
			if (!Object.isUndefined(this.owner.closed_poly) && !this.owner.closed_poly) {
				$C.translate(x, y)
				$C.rotate(this.owner.middle_segment_angle())
				$C.translate(-x, -y)
			}
			
			if (this.fontRotation) {
				$C.translate(x, y)
				if (this.fontRotation == "fixed") {
					$C.rotate(-Map.rotate)
				} else if (Object.isNumber(this.fontRotation)) {
					$C.rotate(this.fontRotation)
				}
				$C.translate(-x, -y)
			}
			
			if (this.fontScale == "fixed") {
				var height = Object.value(this.fontSize)
				var padding = Object.value(this.padding)
			} else {
				var height = Object.value(this.fontSize) / Cartagen.zoom_level
				var padding = Object.value(this.padding) / Cartagen.zoom_level
			}


			var width = $C.measure_text(Object.value(this.fontFamily), 
			                            height,
			                            Object.value(this.text))

			$l('width: ' + width)
			if (this.fontBackground) {
				$C.fill_style(Object.value(this.fontBackground))
				$C.rect(x - (width + padding)/2, 
						y - (height/2 + padding/2), 
						width + padding,
				        height + padding)
			}
			
			$C.draw_text(Object.value(this.fontFamily),
			             height,
						 Object.value(this.fontColor),
			             x - width/2,
						 y + height/2,
						 Object.value(this.text))
			$C.restore()
        }
    }
})