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
		document.observe('mousemove', Events.mousemove)
		Glop.observe('mousedown', Events.mousedown)
		Glop.observe('mouseup', Events.mouseup)
		Glop.observe('dblclick', Events.dblclick)
		Glop.observe('mouseover', Events.mouseover)
		Glop.observe('mouseout', Events.mouseout)

		// (Tool-specific events are handled in the Tool namespace)
		Tool.initialize()
		
		// Observe scrollwheel:
		if (window.addEventListener) window.addEventListener('DOMMouseScroll', Events.wheel, false)
		window.onmousewheel = document.onmousewheel = Events.wheel
		
		// keyboard:
		Event.observe(document, 'keydown', Events.keydown)
		Event.observe(document, 'keypress', Events.keypress)
		Event.observe(document, 'keyup', Events.keyup)
		if (Config.key_input) {
			Keyboard.key_input = true
		}
		
		// touchscreen (mobile phone) events:
		element = $('main')
		element.ontouchstart = Events.ontouchstart
		element.ontouchmove = Events.ontouchmove
		element.ontouchend = Events.ontouchend
		element.ongesturestart = Events.ongesturestart
		element.ongesturechange = Events.ongesturechange
		element.ongestureend = Events.ongestureend
		
		// window events:
		Event.observe(window, 'resize', Events.resize);
	},
	/**
	 * @param {Event} event
	 */
	mousemove: function(event) { 
		Events.enabled = true
		Mouse.x = -1*Event.pointerX(event)
		Mouse.y = -1*Event.pointerY(event)
		Glop.trigger_draw(5)
	},
	/**
	 * Triggered when canvas is clicked on
	 * @param {Event} event
	 */
	mousedown: function(event) {
		Events.mousemove(event)
		if (!event.isLeftClick() || event.ctrlKey) return
	        Mouse.down = true
	        Mouse.click_frame = Glop.frame
	        Mouse.click_x = Mouse.x
	        Mouse.click_y = Mouse.y
		Mouse.dragging = true
		Glop.trigger_draw(5)
	},
	/**
	 * Triggered when mouse is released on canvas
	 */
	mouseup: function(event) {
		if (event && (!event.isLeftClick() || event.ctrlKey)) return
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
				if (!Config.tiles) Map.zoom = (Map.zoom * 1) - (1/20)
				else map.zoomOut()
			} else {
				if (!Config.tiles) Map.zoom = (Map.zoom * 1) + (1/20)
				else map.zoomIn()
			}
			if (Map.zoom < Config.zoom_out_limit) Map.zoom = Config.zoom_out_limit
		}
		Glop.trigger_draw(5)
		event.preventDefault()
	},

	keydown: function(e) {
		var key = e.which || e.keyCode
		if (key == 16 || e.shiftKey) {
			Keyboard.shift = true
		}
	},
	/**
	 * Triggered when a key is pressed
	 * @param {Event} e
	 */
	keypress: function(e) {
		if (Events.enabled === false) return
		if (Events.keys_enabled === false) return

		if (!e) var e = window.event;
		//else if (e.which) code = e.which;
	
		var character = e.which || e.keyCode;
		character = String.fromCharCode(character);
		if (Keyboard.key_input) {
			Keyboard.hotkey(character)
		} else {
			Keyboard.modifier(character)
		}
		// e.preventDefault()
	},

	/**
	 * Triggered when a key is released
	 */
	keyup: function(e) {
		if (Events.enabled === true) {
			Keyboard.shift = false
			if (Events.arrow_keys_enabled === true) {
				var character = e.keyIdentifier
				switch(character) {	
					case 'Left': if (!e.shiftKey) Map.x -= 20/Map.zoom; else Map.rotate += 0.1; break
					case 'Right': if (!e.shiftKey) Map.x += 20/Map.zoom; else Map.rotate -= 0.1; break
					case 'Up': Map.y -= 20/Map.zoom; break
					case 'Down': Map.y += 20/Map.zoom; break
				}
		
				Keyboard.keys.set("r",false)
				Keyboard.keys.set("z",false)
				e.preventDefault()
			}
		}
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
		Map.zoom_old = Map.zoom
	},
	/**
	 * Triggered when a touch gesture is changed or moved. Mainly for touchscreen mobile platforms
	 * @param {Event} e
	 */
	ongesturechange: function(e){
		var node = e.target;
		if (Map.rotate_old == null) Map.rotate_old = Map.rotate
		Map.rotate = Map.rotate_old + (e.rotation/180)*Math.PI
		Map.zoom = Map.zoom_old*e.scale
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
	dblclick: function(event) {
	},
	/**
	 * Triggered each frame. Moves the map based on drags.
	 */
	drag: function() {
		if (Mouse.dragging && !Prototype.Browser.MobileSafari && !window.PhoneGap) {
			Mouse.drag_x = (Mouse.x - Mouse.click_x)
			Mouse.drag_y = (Mouse.y - Mouse.click_y)
			Tool.drag()
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


// This is to adjust for an iPhone turning its orientation - 
// the x and y dimensions will more or less reverse... this code
// would keep the url-bar hidden even so

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
