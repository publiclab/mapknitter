// Track mouse movement:
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
		if (character == "r") keys.set("r",true)
		if (character == "z") keys.set("z",true)
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
			zoom_level += delta/10
		} else {
			zoom_level += delta/10
		}

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
        if (delta)
                handle(delta);
}

/* Initialization code. */
if (window.addEventListener)
        window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;




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
	if (dragging) {
		on_object = false
		objects.each(function(object) {
			// if (object.is_selected) {
			// 	on_object = true
			// 	// send drag to whole group
			// 	selectedObjects.each(function(object) {
			// 		object.dragging = true
			// 		object.drag()
			// 	})
			// } else {
			// 	on_object = true
			// 	object.drag()
			// 	if (object.dragging) {
			// 		lastObject = object
			// 	}				
			// }
		})
		if (!on_object) {
			// pan_x = drag_x
			// pan_y = drag_y
		}
	}
	draw()
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
		on_object = false
		objects.each(function(object) { 
			if (!on_object && overlaps(object.x,object.y,pointerX,pointerY,0)) {
				if ((editmode && object.exploded) || !Event.isLeftClick(event)) {
				} else if (Event.isLeftClick(event)) {
					// Begin dragging
					object.click()
					end_editmode()
					lastObject = object
					object.dragging = true
					dragging = true
				}
				on_object = true
			}
		})
		if (!on_object) {
			globalDragging = true
			
			selectedObjects.each(function(object) {
				object.is_selected = false
			})
			selectedObjects = []
		}
	}
}

function mouseup() {
	mouseUp = true
	mouseDown = false
	releaseFrame = frame
	globalDragging = false
	if (draggedObject != "") {
		// something is being dragged
		on_object = false
		// if it's an organ:
		if (draggedObject instanceof Organ && clickLength() < 10) {
			unexplode_all()
			draggedObject.edit()
			pointerLabel = ""
		}
		objects.each(function(object) { 
			if (!on_object && overlaps(object.x,object.y,pointerX,pointerY,0)) {
				// copy the dragged object's code into a string parameter called 'code'
				if (Object.isString(draggedObject.code)) {
					var code = "'"+draggedObject.code+"'"
				} else {
					var code = draggedObject.code
				}
				eval("object."+draggedObject.organName+" = "+code)
				on_object = true
			}
			if (clickLength() < 10 && !(draggedObject instanceof Organ)) {
				// Open editor
				unexplode_all()
				object.exploded = true
				lastObject = object
				object.rightclick()
			}
		})
		draggedObject = ""
	} else {
		// nothing is being dragged
		if (!dragging && !on_object && !editmode && selectedObjects.length == 0) {
			// if (lastObject == "") {
			// 	var new_box = deep_clone(box)
			// } else {
			// 	var new_box = deep_clone(lastObject)
			// }
			// new_box.x = pointerX
			// new_box.y = pointerY
			// new_box.obj_id = objects.length
			// objects.push(new_box)
			// end_editmode()
		} else if (!on_object && editmode) {			
			end_editmode()
			pointerLabel = ""
		}
		dragging = false
		objects.each(function(object) {
			object.dragging = false
			if (object.is_selected) {
				// alert('deselected')
				selectedObjects.each(function(object) {
					object.dragging = false
					object.old_x = null
					object.old_y = null
				})
			}
		})		
	}
}
load_next_script()