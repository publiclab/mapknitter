// many of these belong in events.js
var frame = 0, width = 0, height = 0, dragging = false, currentObject = "", on_object = false, mouseDown = false, mouseUp = false, clickFrame = 0, releaseFrame, clickX, clickY, globalDragging = false, drag_x, drag_y, single_key, keys = new Hash, key_input = false, last_event = 0, draw_calls = []

canvas = document.getElementById('canvas').getContext('2d')

//CanvasText setup:
CanvasTextFunctions.enable(canvas);

function draw() {
	clear()
	width = document.viewport.getWidth()
	height = document.viewport.getHeight()
	$('canvas').width = width
	$('canvas').height = height
	$$('body')[0].style.width = width+"px"

	frame += 1
	try { drag() } catch(e) {}

	// let additional script subscribe to the draw method:
	draw_calls.each(function(call) {
		
	})
	// cartagen-specific calls
	if (typeof Cartagen != "undefined") Cartagen.draw()
	
	objects.each(function(object) { 
		object.draw()
	})
	
	if (mouseDown) {
		mouseDown = false
	}
	if (mouseUp) {
		mouseUp = false
	}
}

function trace(e) {
	return "An exception occurred in the script. Error name: " + e.name + ". Error description: " + e.description + ". Error number: " + e.number + ". Error message: " + e.message + ". Line number: "+ e.lineNumber
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

function color_from_string(string) {
	return "#"+(parseInt((string),36).toString(16)+"ab2828").truncate(6,"")
}

function randomColor() {
	return "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")"
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
	if (Cartagen.powersave == false || (Cartagen.requested_plots && Cartagen.requested_plots > 0)) {
		draw()
	} else {
		if (last_event > frame-15) {
			draw()
		} else {
			// console.log('sleeping')
		}
	}
}

// seconds between redraws:
new PeriodicalExecuter(draw_powersave, 0.1)
load_next_script()