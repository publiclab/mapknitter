// Track mouse movement:
body = $$('body')[0]
$$('body')[0].observe('mousemove', mousemove)
var pointerX = 0, pointerY = 0
function mousemove(event) { 
	pointerX = Event.pointerX(event)-padding
	pointerY = Event.pointerY(event)-padding
	draw()
}

$('canvas').observe('mousedown', mousedown)
$('canvas').observe('mouseup', mouseup)
$('canvas').observe('dblclick', doubleclick)
Event.observe(document, 'keypress', function(e) {
	var code;
	if (!e) var e = window.event;
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	var character = String.fromCharCode(code);
	if (key_input) {
		if (character == "s") zoom_in()
		if (character == "w") zoom_out()
		if (character == "d") global_rotate += 0.1
		if (character == "a") global_rotate -= 0.1
		if (character == "f") global_x += 20/zoom_level
		if (character == "h") global_x -= 20/zoom_level
		if (character == "t") global_y += 20/zoom_level
		if (character == "g") global_y -= 20/zoom_level
	} else {
		// just modifiers:
		switch(character){
			case "r": keys.set("r",true)
			break
			case "z": keys.set("z",true)
			break
			case "g": $('gss').toggle()
			break
		}
	}
	draw()
});
Event.observe(document, 'keyup', function() {
	modifier = false
	token_mod = false
	keys.set("r",false)
	keys.set("z",false)
	switch (single_key) {
		case "c":
			// Copy all selected objects in-place
			var clonedObjects = []
			selectedObjects.each(function(object){
				var newbox = deep_clone(object)
				newbox.is_proto = false
				// Link child and parent in the clone:
				newbox.clone_parent = object
				object.clone_child = newbox
				newbox.obj_id = highest_id()+1
				newbox.is_selected = false
				// newbox.memory = object.memory.slice()
				objects.push(newbox)
				clonedObjects.push(newbox)
			})
			// Re-assign input obj_ids to new cloned versions
			clonedObjects.each(function(object){
				// var clonedObject = object
			})
			// Clear out all the clone_parent/clone_child references:
			clonedObjects.each(function(object){
				object.clone_parent = null
			})
			selectedObjects.each(function(object){
				object.clone_child = null				
			})
		break
	}
	single_key = null
});


/** This is high-level function; 
* It must react to delta being more/less than zero.
*/
function handle(delta) {
	draw()
       if (delta <0) {
		zoom_level += delta/40
	} else {
		zoom_level += delta/40
	}
	if (zoom_level < zoom_out_limit) zoom_level = zoom_out_limit
}

function wheel(event){
        var delta = 0;
        if (!event) event = window.event;
        if (event.wheelDelta) {
                delta = event.wheelDelta/120;
                if (window.opera) delta = -delta;
        } else if (event.detail) {
                delta = -event.detail/3;
        }
        if (delta) handle(delta);
}

/* Initialization code. */
if (window.addEventListener){
    window.addEventListener('DOMMouseScroll', wheel, false);
}
window.onmousewheel = document.onmousewheel = wheel;

// iPhone events:
if (Prototype.Browser.MobileSafari) {
	body.ontouchstart = function(e){
	  if(e.touches.length == 1){ // Only deal with one finger
	 	var touch = e.touches[0]; // Get the information for finger #1
	    var node = touch.target; // Find the node the drag started from

		mouseDown = true
		clickFrame = frame
		clickX = touch.pageX
		clickY = touch.pageY
		global_x_old = global_x
		global_y_old = global_y
		global_rotate_old = global_rotate
		if (!dragging) {
			globalDragging = true
		}
		
	  }
	}
	body.touchend = function(e) {
		if(e.touches.length == 1) {
			mouseUp = true
			mouseDown = false
			releaseFrame = frame
			globalDragging = false
			if (draggedObject != "") {
			} else {
				dragging = false
			}
		}
	}

	// var width = 100, height = 200, rotation = ;

	body.ongesturechange = function(e){
	  var node = e.target;
	  // scale and rotation are relative values,
	  // so we wait to change our variables until the gesture ends
	  node.style.width = (width * e.scale) + "px";
	  node.style.height = (height * e.scale) + "px";
	  node.style.webkitTransform = "rotate(" + ((rotation + e.rotation) % 360) + "deg)";
	}

	body.ongestureend = function(e){
	  // Update the values for the next time a gesture happens
	  width *= e.scale;
	  height *= e.scale;
	  rotation = (rotation + e.rotation) % 360;
	}	
}

function doubleclick(event) {
	on_object = false
	objects.each(function(object) { 
		if (!on_object && overlaps(object.x,object.y,pointerX,pointerY,0)) {
			object.doubleclick()
			on_object = true
		}
	})
}

function drag() {
	if (globalDragging) {
		// alert('dragging')
		drag_x = (pointerX - clickX)
		drag_y = (pointerY - clickY)
		if (keys.get("r")) { // rotating
			global_rotate = global_rotate_old + (drag_y/height)
		} else if (keys.get("z")) {
			if (zoom_level > 0) {
				zoom_level = Math.abs(zoom_level - (drag_y/height))
			} else {
				zoom_level = 0
			}
		} else {
			global_x = global_x_old+(drag_x/zoom_level)
			global_y = global_y_old+(drag_y/zoom_level)
		}
	}
}

function mousedown(event) {
	mouseDown = true
	clickFrame = frame
	clickX = pointerX
	clickY = pointerY
	global_x_old = global_x
	global_y_old = global_y
	global_rotate_old = global_rotate
	if (!dragging) {
		globalDragging = true
	}
}

function mouseup() {
	mouseUp = true
	mouseDown = false
	releaseFrame = frame
	globalDragging = false
	if (draggedObject != "") {
	} else {
		dragging = false
	}
}
load_next_script()