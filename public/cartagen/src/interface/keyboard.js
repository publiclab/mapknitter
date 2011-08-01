/**
 * @namespace Stores information about the state of the keyboard
 */
var Keyboard = {
	/**
	 * Hash of keys and whether they are down
	 * @type Hash (String -> Boolean)
	 */
	keys: new Hash(),
	/**
	 * Whether Cartagen will be controlled by the keyboard
	 * @type Boolean
	 */
	key_input: false,
	/**
	 * Whether the shift key is down
	 * @type Boolean
	 */
	shift: false,
	hotkeys: {
		"=": function() {
			if (Config.tiles) map.zoomIn()
			else Map.zoom *= 1.1
		},
		"-": function() {
			if (Config.tiles) map.zoomOut()
			else Map.zoom *= 0.9
		},
		"x": function() {
			localStorage.clear()
		},
		"r": function() {
			Tool.unpress(['warp_distort'])
			$('tool_warp_rotate').addClassName('down')
			Tool.Warp.mode = 'rotate'
		},
		"d": function() {
			Tool.unpress(['warp_rotate'])
			$('tool_warp_distort').addClassName('down')
			Tool.Warp.mode = 'default'
		},
		"t": function() {
			Warper.active_image.dblclick()
		},
		"o": function() {
			Warper.active_image.toggle_outline()
		},
		"l": function() {
			Tool.Warp.lock_image()
		},
	},
	hotkey: function(key) {
		if (Keyboard.hotkeys[key]) Keyboard.hotkeys[key]()
		Glop.trigger_draw()
	},
	modifier: function(key) {
		switch(character){
			case "r": Keyboard.keys.set("r",true); break
			case "z": Keyboard.keys.set("z",true); break
			case "g": if (Config.debug && !Config.live_gss) Cartagen.show_gss_editor(); break
			case "b": if (Config.debug) Interface.download_bbox()
			case Event.KEY_UP: Cartagen.fire('keypress:up')
			case Event.KEY_DOWN: Cartagen.fire('keypress:down')
			case Event.KEY_LEFT: Cartagen.fire('keypress:left')
			case Event.KEY_RIGHT: Cartagen.fire('keypress:right')
		}
	}
}
