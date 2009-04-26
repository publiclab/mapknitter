function style(feature,selector) {
	fillStyle("#aaa") //greyish
	strokeStyle("#333") //greyish
	// try {
		if (selector.fillStyle) fillStyle(selector.fillStyle)
		if (selector.lineWidth || selector.lineWidth == 0) lineWidth(selector.lineWidth)
		if (selector.strokeStyle) {
			if (Object.isFunction(selector.strokeStyle)) {
				// bind the styles object to the context of this Way:
				strokeStyle(selector.strokeStyle.apply(feature))
			} else {
				strokeStyle(selector.strokeStyle)
			}
		}
		if (selector.radius) feature.radius = selector.radius

			feature.tags.each(function(tag) {

				//look for a style like this:
					if (styles[tag.key] && styles[tag.key].fillStyle) {
						fillStyle(styles[tag.key].fillStyle)
					}
					if (styles[tag.value] && styles[tag.value].fillStyle) {
						fillStyle(styles[tag.value].fillStyle)
					}
					if (styles[tag.key] && styles[tag.key].strokeStyle) {
						strokeStyle(styles[tag.key].strokeStyle)
					}
					if (styles[tag.value] && styles[tag.value].strokeStyle) {
						strokeStyle(styles[tag.value].strokeStyle)
					}
					if (styles[tag.key] && styles[tag.key].lineWidth) {
						lineWidth(styles[tag.key].lineWidth)
					}
					if (styles[tag.value] && styles[tag.value].lineWidth) {
						lineWidth(styles[tag.value].lineWidth)
					}
				
				// fillStyle(color_from_string(feature.user))
			})
	// } catch(e) {
	// 
	// }
}

// add_style('highway','strokeStyle','red')
function add_style(tag,style,value) {
	eval("styles."+tag+" = {"+style+": '"+value+"'}")
	// styles[tag][style] = value
}
load_next_script()