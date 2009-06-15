
var Label = Class.create({
    fontFamily: 'Lucida Grande',
    fontSize: 11,
    fontBackground: null,
    text: null,
    fontScale: false,
    padding: 6,
    fontColor: '#eee',
	fontRotation: 0,
    initialize: function(_way) {
        this.way = _way
    },
    draw: function(_x, _y) {
        if (this.text) {
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
				translate(_x,_y)
				if (this.fontRotation == "fixed") {
					rotate(-Map.rotate)
				} else if (Object.isNumber(this.fontRotation)) {
					rotate(this.fontRotation)
				}
				translate(-_x,-_y)
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
        }
    }


})