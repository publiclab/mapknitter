/**
 * @namespace Contains native event callbacks and binds them to events.
 */
var Events = {
	last_event: 0,
	
	/**
	 * Binds each event handler to its event.
	 */
	init: function() {
		// Observe mouse events:
		var canvas = $('canvas')
		canvas.observe('mousemove', Events.mousemove)
		canvas.observe('mousedown', Events.mousedown)
		canvas.observe('mouseup', Events.mouseup)
		canvas.observe('dblclick', Events.doubleclick)
		canvas.observe('mouseover', Events.mouseover)
		canvas.observe('mouseout', Events.mouseout)
		
		
		// Observe scrollwheel:
		if (window.addEventListener) window.addEventListener('DOMMouseScroll', Events.wheel, false)
		window.onmousewheel = document.onmousewheel = Events.wheel
		
		// keyboard:
		Event.observe(document, 'keypress', Events.keypress)
		Event.observe(document, 'keyup', Events.keyup)
		
		// touchscreen (mobile phone) events:
		canvas.ontouchstart = Events.ontouchstart
		canvas.ontouchmove = Events.ontouchmove
		canvas.ontouchend = Events.ontouchend
		canvas.ongesturestart = Events.ongesturestart
		canvas.ongesturechange = Events.ongesturechange
		canvas.ongestureend = Events.ongestureend
		
		// window events:
		Event.observe(window, 'resize', Events.resize);
	},
	/**
	 * Triggered when moused is moved on the canvas
	 * @param {Event} event
	 */
	mousemove: function(event) { 
		Events.enabled = true
		Mouse.x = -1*Event.pointerX(event)
		Mouse.y = -1*Event.pointerY(event)
		var lon = Projection.x_to_lon(-1*Map.pointer_x())
		var lat = Projection.y_to_lat(Map.pointer_y())
		var features = Geohash.get_current_features_upward(encodeGeoHash(lat, lon))
		if (features) features.reverse().concat(Mouse.hovered_features).invoke('style')
		Glop.trigger_draw(5)
	},
	/**
	 * Triggered when canvas is clicked on
	 * @param {Event} event
	 */
	mousedown: function(event) {
		if (!event.isLeftClick()) return
        Mouse.down = true
        Mouse.click_frame = Glop.frame
        Mouse.click_x = Mouse.x
        Mouse.click_y = Mouse.y
        Map.x_old = Map.x
        Map.y_old = Map.y
        Map.rotate_old = Map.rotate
		Mouse.dragging = true
		Events.mousemove(event)
		// $l('mousedown')
		Glop.trigger_draw(5)
	},
	/**
	 * Triggered when mouse is released on canvas
	 */
	mouseup: function(event) {
		if (!event.isLeftClick()) return
        Mouse.up = true
        Mouse.down = false
        Mouse.release_frame = Glop.frame
        Mouse.dragging = false
        User.update()
	},
	/**
	 * Triggered when the mouse wheel is used
	 * @param {Event} event
	 */
	wheel: function(event){
		if (Events.enabled == false) return
		var delta = 0
		if (!event) event = window.event
		if (event.wheelDelta) {
			delta = event.wheelDelta/120
			if (window.opera) delta = -delta
		} else if (event.detail) {
			delta = -event.detail/3
		}
		if (delta && !Config.live_gss) {
			if (delta <0) {
				Map.zoom = (Map.zoom * 1) + (delta/80)
			} else {
				Map.zoom = (Map.zoom * 1) + (delta/80)
			}
			if (Map.zoom < Config.zoom_out_limit) Map.zoom = Config.zoom_out_limit
		}
		Glop.trigger_draw(5)
		event.preventDefault()
	},
	/**
	 * Triggered when a key is pressed
	 * @param {Event} e
	 */
	keypress: function(e) {
		if (Events.enabled === false) return

		var code;
		if (!e) var e = window.event;

		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		var character = String.fromCharCode(code);
		if (Keyboard.key_input) {
			switch(character) {
				case "s": zoom_in(); break
				case "w": zoom_out(); break
				case "d": Map.rotate += 0.1; break
				case "a": Map.rotate -= 0.1; break
				case "f": Map.x += 20/Map.zoom; break
				case "h": Map.x -= 20/Map.zoom; break
				case "t": Map.y += 20/Map.zoom; break
				case "g": Map.y -= 20/Map.zoom; break
				case "x": localStorage.clear()
			}
		} else {
			// just modifiers:
			switch(character){
				case "r": Keyboard.keys.set("r",true); break
				case "z": Keyboard.keys.set("z",true); break
				case "g": if (!Config.live_gss) Cartagen.show_gss_editor(); break
				case "h": get_static_plot('/static/rome/highway.js'); break
				case "b": Interface.download_bbox()
			}
		}
		Glop.trigger_draw(5)
		e.preventDefault()
	},
	/**
	 * Triggered when a key is released
	 */
	keyup: function(e) {
		if (Events.enabled === false) return
		
		Keyboard.keys.set("r",false)
		Keyboard.keys.set("z",false)
		e.preventDefault()
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

			Mouse.down = true
			Mouse.click_frame = Glop.frame
			Mouse.click_x = touch.screenX
			Mouse.click_y = touch.screenY
			Map.x_old = Map.x
			Map.y_old = Map.y
			Mouse.dragging = true
			Glop.trigger_draw(5)	
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

			Mouse.drag_x = (touch.screenX - Mouse.click_x)
			Mouse.drag_y = (touch.screenY - Mouse.click_y)

			var d_x = -Math.cos(Map.rotate)*Mouse.drag_x+Math.sin(Map.rotate)*Mouse.drag_y
			var d_y = -Math.cos(Map.rotate)*Mouse.drag_y-Math.sin(Map.rotate)*Mouse.drag_x

			Map.x = Map.x_old+(d_x/Map.zoom)
			Map.y = Map.y_old+(d_y/Map.zoom)

			Glop.trigger_draw(5)
		}
	},
	/**
	 * Triggered when a touch is ended. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ontouchend: function(e) {
		if(e.touches.length == 1) {
			Mouse.up = true
			Mouse.down = false
			Mouse.release_frame = Glop.frame
			Mouse.dragging = false
		}
		User.update()
		Glop.trigger_draw(5)
	},
	/**
	 * Triggered when a touch gesture is started. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ongesturestart: function(e) {
		zoom_level_old = Map.zoom
	},
	/**
	 * Triggered when a touch gesture is changed or moved. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ongesturechange: function(e){
		var node = e.target;
		if (Map.rotate_old == null) Map.rotate_old = Map.rotate
		Map.rotate = Map.rotate_old + (e.rotation/180)*Math.PI
		Map.zoom = zoom_level_old*e.scale
		Glop.trigger_draw(5)
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
	 * Triggered when the canvas is double clicked. Currently unused
	 * @param {Event} event
	 */
	doubleclick: function(event) {
	},
	/**
	 * Triggered each frame. Moves the map based on drags.
	 */
	drag: function() {
		if (Mouse.dragging && !Prototype.Browser.MobileSafari && !window.PhoneGap) {
			Mouse.drag_x = (Mouse.x - Mouse.click_x)
			Mouse.drag_y = (Mouse.y - Mouse.click_y)
			if (Keyboard.keys.get("r")) { // rotating
				Map.rotate = Map.rotate_old + (-1*Mouse.drag_y/Glop.height)
			} else if (Keyboard.keys.get("z")) {
				if (Map.zoom > 0) {
					Map.zoom = Math.abs(Map.zoom - (Mouse.drag_y/Glop.height))
				} else {
					Map.zoom = 0
				}
			} else {
				var d_x = Math.cos(Map.rotate)*Mouse.drag_x+Math.sin(Map.rotate)*Mouse.drag_y
				var d_y = Math.cos(Map.rotate)*Mouse.drag_y-Math.sin(Map.rotate)*Mouse.drag_x
				
				Map.x = Map.x_old+(d_x/Map.zoom)
				Map.y = Map.y_old+(d_y/Map.zoom)
			}
		}
	},
	/**
	 * Returns the number of frames a click has lasted for.
	 */
	click_length: function() {
		return Mouse.release_frame-Mouse.click_frame
	},
	resize: function() {
		Glop.trigger_draw(5)
	},
	mouseover: function() {
		Events.enabled = true
	},
	mouseout: function() {
		Events.enabled = false
	}
}
// bind event
document.observe('cartagen:init', Events.init)


// not sure what this is:

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
