var ContextMenu = {
	cond_items: {},
	init: function() {
		this.menu = new Control.ContextMenu('canvas')
	},
	add_cond_item: function(name, callback) {
		var id = Math.round(Math.random() * 999999999)

		//while(!cond_items[id]) {
		//	id = Math.round(Math.random() * 999999999)
		//}
		
		callback.avail = false
		callback.context = window
		ContextMenu.cond_items[id] = callback

		this.menu.addItem({
				label: name,
				callback: function() {
					(ContextMenu.cond_items[id].bind(ContextMenu.cond_items[id].context))()
				},
				condition: function() {
					return ContextMenu.cond_items[id].avail
				}
		})
		
		return id
	},
	add_static_item: function(name, _callback) {
		this.menu.addItem({
			label: name,
			callback: _callback,
		})
	}
}

document.observe('cartagen:init', ContextMenu.init.bindAsEventListener(ContextMenu))
