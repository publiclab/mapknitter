/**
 * @namespace
 * Contains event callbacks and binds them to events.
 */
var Events = {
	/**
	 * Binds each event handler to its event.
	 */
	init: function() {
		// Observe mouse events:
		var canvas_el = $('canvas')
		canvas_el.observe('mousemove', Events.mousemove)
		canvas_el.observe('mousedown', Events.mousedown)
		canvas_el.observe('mouseup', Events.mouseup)
		canvas_el.observe('dblclick', Events.doubleclick)
		
		// Observe scrollwheel:
		if (window.addEventListener) window.addEventListener('DOMMouseScroll', Events.wheel, false)
		window.onmousewheel = document.onmousewheel = Events.wheel
		
		// keyboard:
		Event.observe(document, 'keypress', Events.keypress)
		Event.observe(document, 'keyup', Events.keyup)
		
		// touchscreen (mobile phone) events:
		canvas_el.ontouchstart = Events.ontouchstart
		canvas_el.ontouchmove = Events.ontouchmove
		canvas_el.ontouchend = Events.ontouchend
		canvas_el.ongesturestart = Events.ongesturestart
		canvas_el.ongesturechange = Events.ongesturechange
		canvas_el.ongestureend = Events.ongestureend
	},
	/**
	 * Triggered when moused is moved on the canvas
	 * @param {Event} event
	 */
	mousemove: function(event) { 
		Mouse.x = -1*Event.pointerX(event)
		Mouse.y = -1*Event.pointerY(event)
		draw()
	},
	/**
	 * Triggered when canvas is clicked on
	 * @param {Event} event
	 */
	mousedown: function(event) {
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
	},
	/**
	 * Triggered when mouse is released on canvas
	 */
	mouseup: function() {
        mouseUp = true
        mouseDown = false
        releaseFrame = frame
        globalDragging = false
        dragging = false
        User.update()
	},
	/**
	 * Triggered when the mouse wheel is used
	 * @param {Event} event
	 */
	wheel: function(event){
		var delta = 0;
		if (!event) event = window.event;
		if (event.wheelDelta) {
			delta = event.wheelDelta/120;
			if (window.opera) delta = -delta;
		} else if (event.detail) {
			delta = -event.detail/3;
		}
		if (delta && !Cartagen.live_gss) {
			if (delta <0) {
				Cartagen.zoom_level += delta/40
			} else {
				Cartagen.zoom_level += delta/40
			}
			if (Cartagen.zoom_level < Cartagen.zoom_out_limit) Cartagen.zoom_level = Cartagen.zoom_out_limit
		}
		draw()
	},
	/**
	 * Triggered when a key is pressed
	 * @param {Event} e
	 */
	keypress: function(e) {
		var code;
		if (!e) var e = window.event;
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		var character = String.fromCharCode(code);
		if (key_input) {
			switch(character) {
				case "s": zoom_in(); break
				case "w": zoom_out(); break
				case "d": Map.rotate += 0.1; break
				case "a": Map.rotate -= 0.1; break
				case "f": Map.x += 20/Cartagen.zoom_level; break
				case "h": Map.x -= 20/Cartagen.zoom_level; break
				case "t": Map.y += 20/Cartagen.zoom_level; break
				case "g": Map.y -= 20/Cartagen.zoom_level; break
			}
		} else {
			// just modifiers:
			switch(character){
				case "r": keys.set("r",true); break
				case "z": keys.set("z",true); break
				case "g": if (!Cartagen.live_gss) Cartagen.show_gss_editor(); break
				case "h": get_static_plot('/static/rome/highway.js'); break
			}
		}
		draw()
	},
	/**
	 * Triggered when a key is released
	 */
	keyup: function() {
		keys.set("r",false)
		keys.set("z",false)
		single_key = null
	},
	/**
	 * Triggered when a touch is started. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ontouchstart: function(e){
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
	},
	/**
	 * Triggered when a touch is moved. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ontouchmove: function(e) {	
		e.preventDefault();
		if(e.touches.length == 1){ // Only deal with one finger
			var touch = e.touches[0]; // Get the information for finger #1
			var node = touch.target; // Find the node the drag started from

			drag_x = (touch.screenX - Mouse.click_x)
			drag_y = (touch.screenY - Mouse.click_y)

			var d_x = -Math.cos(Map.rotate)*drag_x+Math.sin(Map.rotate)*drag_y
			var d_y = -Math.cos(Map.rotate)*drag_y-Math.sin(Map.rotate)*drag_x

			Map.x = Map.x_old+(d_x/Cartagen.zoom_level)
			Map.y = Map.y_old+(d_y/Cartagen.zoom_level)

			draw()
		}
	},
	/**
	 * Triggered when a touch is ended. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ontouchend: function(e) {
		if(e.touches.length == 1) {
			mouseUp = true
			mouseDown = false
			releaseFrame = frame
			globalDragging = false
			dragging = false
		}
		User.update()
		draw()
	},
	/**
	 * Triggered when a touch gesture is started. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ongesturestart: function(e) {
		zoom_level_old = Cartagen.zoom_level
	},
	/**
	 * Triggered when a touch gesture is changed or moved. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ongesturechange: function(e){
		var node = e.target;
		if (Map.rotate_old == null) Map.rotate_old = Map.rotate
		Map.rotate = Map.rotate_old + (e.rotation/180)*Math.PI
		Cartagen.zoom_level = zoom_level_old*e.scale
		draw()
	},
	/**
	 * Triggered when a touch gesture is ended. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	gestureend: function(e){
		Map.rotate_old = null
		User.update()
	},
	/**
	 * Triggered when the canvas is double clicked
	 * @param {Event} event
	 */
	doubleclick: function(event) {
		on_object = false
		objects.each(function(object) { 
			if (!on_object && Geometry.overlaps(object.x,object.y,Mouse.x,Mouse.y,0)) {
				object.doubleclick()
				on_object = true
			}
		})
	},
	/**
	 * Currently unused?
	 */
	drag: function() {
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
				// var h = Math.sqrt((drag_x*drag_x)+(drag_y*drag_y))
				var d_x = Math.cos(Map.rotate)*drag_x+Math.sin(Map.rotate)*drag_y
				var d_y = Math.cos(Map.rotate)*drag_y-Math.sin(Map.rotate)*drag_x
				
				Map.x = Map.x_old+(d_x/Cartagen.zoom_level)
				Map.y = Map.y_old+(d_y/Cartagen.zoom_level)
				// Map.x = Map.x_old+(drag_x/Cartagen.zoom_level)
				// Map.y = Map.y_old+(drag_y/Cartagen.zoom_level)
			}
		}
	},
	/**
	 * Returns the number of frames a click has lasted for. Currently unused?
	 */
	click_length: function() {
		return releaseFrame-clickFrame
	}
}

//if (Prototype.Browser.MobileSafari) {
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
//}
