// events.js
//
// Copyright (C) 2009 Jeffrey Warren, Design Ecology, MIT Media Lab
//
// This file is part of the Cartagen mapping framework. Read more at
// <http://cartagen.org>
//
// Cartagen is free software: you can redistribute it and/or modify
// it under the terms of the MIT License. You should have received a copy 
// of the MIT License along with Cartagen.  If not, see
// <http://www.opensource.org/licenses/mit-license.php>.
//

function mousemove(event) { 
	Mouse.x = -1*Event.pointerX(event)
	Mouse.y = -1*Event.pointerY(event)
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
	if (delta && !Cartagen.live_gss) {
		draw()
		if (delta <0) {
			Cartagen.zoom_level += delta/40
		} else {
			Cartagen.zoom_level += delta/40
		}
		if (Cartagen.zoom_level < Cartagen.zoom_out_limit) Cartagen.zoom_level = Cartagen.zoom_out_limit
	}
}

// Observe mouse events:
body = $('body')
var canvas_el = $('canvas')
canvas_el.observe('mousemove', mousemove)
canvas_el.observe('mousedown', mousedown)
canvas_el.observe('mouseup', mouseup)
canvas_el.observe('dblclick', doubleclick)
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
		if (character == "d") Map.rotate += 0.1
		if (character == "a") Map.rotate -= 0.1
		if (character == "f") Map.x += 20/Cartagen.zoom_level
		if (character == "h") Map.x -= 20/Cartagen.zoom_level
		if (character == "t") Map.y += 20/Cartagen.zoom_level
		if (character == "g") Map.y -= 20/Cartagen.zoom_level
	} else {
		// just modifiers:
		switch(character){
			case "r": keys.set("r",true)
			break
			case "z": keys.set("z",true)
			break
			case "g": 
				if (!Cartagen.live_gss) Cartagen.show_gss_editor()
			break
			case "h": get_static_plot('/static/rome/highway.js')
		}
	}
	draw()
});
Event.observe(document, 'keyup', function() {
	keys.set("r",false)
	keys.set("z",false)
	switch (single_key) {
	}
	single_key = null
});

// iPhone events:
if (Prototype.Browser.MobileSafari || window.PhoneGap) {
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

	canvas_el.ontouchstart = function(e){
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
	canvas_el.ontouchmove = function(e) {	
		e.preventDefault();
		if(e.touches.length == 1){ // Only deal with one finger
			var touch = e.touches[0]; // Get the information for finger #1
			var node = touch.target; // Find the node the drag started from

			drag_x = (touch.screenX - Mouse.click_x)
			drag_y = (touch.screenY - Mouse.click_y)
			Map.x = Map.x_old+(-1*drag_x/Cartagen.zoom_level)
			Map.y = Map.y_old+(-1*drag_y/Cartagen.zoom_level)
			draw()
		}
	}
	canvas_el.ontouchend = function(e) {
		if(e.touches.length == 1) {
			mouseUp = true
			mouseDown = false
			releaseFrame = frame
			globalDragging = false
			dragging = false
		}
		draw()
	}
	canvas_el.ongesturestart = function(e) {
		zoom_level_old = Cartagen.zoom_level
	}
	canvas_el.ongesturechange = function(e){
	  var node = e.target;
		if (Map.rotate_old == null) Map.rotate_old = Map.rotate
		Map.rotate = Map.rotate_old + (e.rotation/180)*Math.PI
		Cartagen.zoom_level = zoom_level_old*e.scale
		draw()
	}
	canvas_el.ongestureend = function(e){
		Map.rotate_old = null
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
	if (globalDragging && !Prototype.Browser.MobileSafari && !window.PhoneGap) {
		drag_x = (Mouse.x - Mouse.click_x)
		drag_y = (Mouse.y - Mouse.click_y)
		if (keys.get("r")) { // rotating
			Map.rotate = Map.rotate_old + (-1*drag_y/height)
		} else if (keys.get("z")) {
			if (Cartagen.zoom_level > 0) {
				Cartagen.zoom_level = Math.abs(Cartagen.zoom_level - (drag_y/height))
			} else {
				Cartagen.zoom_level = 0
			}
		} else {
			Map.x = Map.x_old+(drag_x/Cartagen.zoom_level)
			Map.y = Map.y_old+(drag_y/Cartagen.zoom_level)
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
	Map.rotate_old = Map.rotate
	if (!dragging) {
		globalDragging = true
	}
}

function mouseup() {
	mouseUp = true
	mouseDown = false
	releaseFrame = frame
	globalDragging = false
	dragging = false
}

function clickLength() {
	return releaseFrame-clickFrame
}

load_next_script()