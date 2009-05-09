var frame = 0, width = 0, height = 0, padding = 0, editmode = false, dragging = false, supermode = false, currentObject = "", pointerLabel = "", on_object = false, mouseDown = false, mouseUp = false, draggedObject = "", lastObject = "", clickFrame = 0, releaseFrame, mode = "layout", modifier = false, arrow_drawing_box = "", clickX, clickY, globalDragging = false, selectedObjects = [], glyphs = [], drag_x, drag_y, single_key, zoom_level = 0.75, global_rotate = Math.PI, global_x = 0, global_y = 0, drawing = false, styles = "", global_x_old, global_y_old, global_rotate_old, keys = new Hash, key_input = false

pointerX = 0,pointerY = 0

if (typeof console == "undefined") {
	console = {
		log: function(param) {
			
		}
	}
}

// This contains all stage objects:
var objects = []
var log = []

canvas = document.getElementById('canvas').getContext('2d')
canvas.globalAlpha = 0.8
$('pointerLabel').absolutize()

function drag() {
	if (dragging) {
		on_object = false
		objects.each(function(object) {
			if (object.is_selected) {
				// send drag to whole group
				// alert('groupdrag!')
				selectedObjects.each(function(object) {
					object.offset_x = pointerX-object.x
					object.offset_y = pointerY-object.y
					object.dragging = true
					object.drag()
				})
			} else {
				object.drag()
				if (object.dragging) {
					lastObject = object
				}				
			}
		})		
	}
}

function highest_id() {
	var high = 0
	objects.each(function(object) {
		if (object.obj_id > high) high = object.obj_id
	})
	return high
}

function isNthFrame(num) {
	return ((frame % num) == 0);
}

function toggle(object) {
	if (object == true) {
		object = false
	} else if (object == false) {
		object = true
	}
	return object
}

function clickLength() {
	return releaseFrame-clickFrame
}

function color_from_string(string) {
	return "#"+(parseInt((string),36).toString(16)+"ab2828").truncate(6,"")
}

function randomColor() {
	return "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")"
}

function pointer_label() {
	clearLog()
	trace(pointerLabel)
	if (pointerLabel == "") {
		$('pointerLabel').update("")
		$('pointerLabel').hide()
	} else {
		$('pointerLabel').update("<span>"+pointerLabel+"</span>")
		$('pointerLabel').style.left = (pointerX+padding)+"px"
		$('pointerLabel').style.top = (pointerY+padding-30)+"px"
		$('pointerLabel').show()
	}
}

function zoom_in() {
	zoom_level = zoom_level * 1.1
}
function zoom_out() {
	zoom_level = zoom_level * 0.9
}

function draw() {
	if (drawing == false) {
		drawing = true
		clear()
		width = document.viewport.getWidth()
		height = document.viewport.getHeight()
		$('canvas').width = width
		$('canvas').height = height
		$$('body')[0].style.width = width+"px"

		frame += 1
		drag()

		if (typeof cartagen != "undefined") cartagen()
		objects.each(function(object) { 
			object.draw()
		})
			// cartagen crosshairs
			// beginPath()
			// moveTo(map_pointerX(),map_pointerY()-10)
			// lineTo(map_pointerX(),map_pointerY()+10)
			// moveTo(map_pointerX()-10,map_pointerY())
			// lineTo(map_pointerX()+10,map_pointerY())
			// stroke()
		
		if (mouseDown) {
			mouseDown = false
		}
		if (mouseUp) {
			mouseUp = false
		}
		drawing = false
	}
}

function jsonify(input,newlines) {
	if (newlines == null) var newline = ""
	else var newline = "\r"
	var json = ""
	if (input instanceof Array) {
		var string = ''
		input.each(function(item) {
			string += jsonify(item)+","+newline
		})
		string = string.truncate(string.length-1,'')
		json += "["+string+"]"
	} else if (Object.isString(input)) {
		json += "'"+String(input).escapeHTML()+"'"
	} else if (Object.isNumber(input)) {
		json += String(input)
	} else if (typeof input == 'object') {
		var string = ''
		Object.keys(input).each(function(key,index) {
			string += key+": "+jsonify(Object.values(input)[index])+", "+newline
		})
		string.truncate(string.length-1)
		json += "{"+string+"}"
	} else {
		json += String(input).escapeHTML()
	}
	return json
}

function deep_clone(obj) {
    var c = {};
    for (var i in obj) {
        var prop = obj[i];
 
        if (prop instanceof Array) {
			c[i] = prop.slice();
        } else if (typeof prop == 'object') {
           c[i] = deep_clone(prop);
		} else {
           c[i] = prop;
        }
    }
    return c;
}

function draw_powersave() {
	if (requested_plots && requested_plots > 0) {
		draw()
	} else {
		if (last_event > frame-20) {
			draw()
		}
	}
}

// seconds between redraws:
new PeriodicalExecuter(draw, 0.1);
load_next_script()