var Mouse = {
	x: 0,
	y: 0,
	click_x: 0,
	click_y: 0
}

function mousemove(event) { 
	Mouse.x = Event.pointerX(event)
	Mouse.y = Event.pointerY(event)
	draw()
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
	if (delta && !live_gss) {
		draw()
		if (delta <0) {
			zoom_level += delta/40
		} else {
			zoom_level += delta/40
		}
		if (zoom_level < zoom_out_limit) zoom_level = zoom_out_limit
	}
}

// Observe mouse events:
body = $$('body')[0]
body.observe('mousemove', mousemove)
body.observe('mousedown', mousedown)
body.observe('mouseup', mouseup)
body.observe('dblclick', doubleclick)
// Observe scrollwheel:
if (window.addEventListener) window.addEventListener('DOMMouseScroll', wheel, false)
window.onmousewheel = document.onmousewheel = wheel

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
		if (character == "f") Map.x += 20/zoom_level
		if (character == "h") Map.x -= 20/zoom_level
		if (character == "t") Map.y += 20/zoom_level
		if (character == "g") Map.y -= 20/zoom_level
	} else {
		// just modifiers:
		switch(character){
			case "r": keys.set("r",true)
			break
			case "z": keys.set("z",true)
			break
			case "g": 
				if (!live_gss) {
					Cartagen.show_gss_editor()
				}
			break
			case "h": get_static_plot('/static/rome/highway.js')
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
	}
	single_key = null
});

// iPhone events:
if (Prototype.Browser.MobileSafari) {
	// get rid of url bar:
	
	// addEventListener("load", function() { setTimeout(updateLayout, 0) }, false)
	// var currentWidth = 0;
	// function updateLayout() {
	//     if (window.innerWidth != currentWidth) {
	//         currentWidth = window.innerWidth;
	//         var orient = currentWidth == 320 ? "profile" : "landscape";
	//         document.body.setAttribute("orient", orient);
	//         setTimeout(function() {
	//             window.scrollTo(0, 1);
	//         }, 100);           
	//     }
	// }
	// setInterval(updateLayout, 400);

	body.ontouchstart = function(e){
		e.preventDefault();
		if(e.touches.length == 1){ // Only deal with one finger
	 		var touch = e.touches[0]; // Get the information for finger #1
		    var node = touch.target; // Find the node the drag started from

			mouseDown = true
			clickFrame = frame
			Mouse.click_x = touch.screenX
			Mouse.click_y = touch.screenY
			Map.x_old = Map.x
			Map.y_old = Map.y
			if (!dragging) {
				globalDragging = true
			}
			draw()	
		  }
	}
	body.ontouchmove = function(e) {		
		e.preventDefault();
		if(e.touches.length == 1){ // Only deal with one finger
	 	var touch = e.touches[0]; // Get the information for finger #1
	    var node = touch.target; // Find the node the drag started from

		drag_x = (touch.screenX - Mouse.click_x)
		drag_y = (touch.screenY - Mouse.click_y)
		Map.x = Map.x_old+(drag_x/zoom_level)
		Map.y = Map.y_old+(drag_y/zoom_level)
		draw()
	  }
	}
	body.ontouchend = function(e) {
		if(e.touches.length == 1) {
			mouseUp = true
			mouseDown = false
			releaseFrame = frame
			globalDragging = false
			dragging = false
		}
		draw()
	}
	body.ongesturestart = function(e) {
		zoom_level_old = zoom_level
	}
	body.ongesturechange = function(e){
	  var node = e.target;
		if (global_rotate_old == null) global_rotate_old = global_rotate
		global_rotate = global_rotate_old + (e.rotation/180)*Math.PI
		zoom_level = zoom_level_old*e.scale
		draw()
	}
	body.ongestureend = function(e){
		global_rotate_old = null
	}	
}

function doubleclick(event) {
	on_object = false
	objects.each(function(object) { 
		if (!on_object && overlaps(object.x,object.y,Mouse.x,Mouse.y,0)) {
			object.doubleclick()
			on_object = true
		}
	})
}

function drag() {
	if (globalDragging && !Prototype.Browser.MobileSafari) {
		// alert('dragging')
		drag_x = (Mouse.x - Mouse.click_x)
		drag_y = (Mouse.y - Mouse.click_y)
		if (keys.get("r")) { // rotating
			global_rotate = global_rotate_old + (drag_y/height)
		} else if (keys.get("z")) {
			if (zoom_level > 0) {
				zoom_level = Math.abs(zoom_level - (drag_y/height))
			} else {
				zoom_level = 0
			}
		} else {
			Map.x = Map.x_old+(drag_x/zoom_level)
			Map.y = Map.y_old+(drag_y/zoom_level)
		}
	}
}

function mousedown(event) {
	mouseDown = true
	clickFrame = frame
	Mouse.click_x = Mouse.x
	Mouse.click_y = Mouse.y
	Map.x_old = Map.x
	Map.y_old = Map.y
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

function clickLength() {
	return releaseFrame-clickFrame
}

load_next_script()