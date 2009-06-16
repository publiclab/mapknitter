var Label = Class.create({
    initialize: function(_way) {
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
		 * Background color for label. Set to null for no label.
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
		 * The parent way that this label belongs to
		 * @type Way
		 */
        this.way = _way
    },
    draw: function(_x, _y) {
        if (this.text) {
			try {
            canvas.save()
            //this.text = this.way.id
            Style.apply_font_style(this)

			// try to rotate the labels on unclosed ways:
			try {
				if (!this.way.closed_poly) {
					$C.translate(_x,_y)
					$C.rotate(this.way.middle_segment_angle())
					$C.translate(-_x,-_y)
				}
			} catch(e) {console.log(e)}
			if (this.fontRotation) {
				$C.translate(_x,_y)
				if (this.fontRotation == "fixed") {
					$C.rotate(-Map.rotate)
				} else if (Object.isNumber(this.fontRotation)) {
					$C.rotate(this.fontRotation)
				}
				$C.translate(-_x,-_y)
			}
			if (this.fontScale == "fixed") {
				var _height = Object.value(this.fontSize)
				var _padding = Object.value(this.padding)
			} else {
				var _height = Object.value(this.fontSize)/Cartagen.zoom_level
				var _padding = Object.value(this.padding)/Cartagen.zoom_level
			}

			if (canvas.fillText) { // || Prototype.Browser.Gecko) {
				canvas.font = _height+"pt "+this.fontFamily
				var _width = canvas.measureText(Object.value(this.text)).width
				if (this.fontBackground) {
					$C.fill_style(Object.value(this.fontBackground))
					$C.rect(_x-((_width+_padding)/2),_y-((_height/2+(_padding/2))),_width+_padding,_height+_padding)
				}
				$C.fill_style(Object.value(this.fontColor))
	            canvas.fillText(Object.value(this.text),_x-(_width/2),_y+(_height/2))	
			} else {
				var _width = canvas.measureCanvasText(Object.value(this.fontFamily),_height,this.text)
				if (this.fontBackground) {
					$C.fill_style(Object.value(this.fontBackground))
					$C.rect(_x-((_width+_padding)/2),_y-((_height/2+(_padding/2))),_width+_padding,_height+_padding)
				}
				$C.draw_text_center(Object.value(this.fontFamily),_height,_x,_y+(_height/2),Object.value(this.text))
			}
			canvas.restore()
			} catch (e) {console.log(e)}
        }
    }


})