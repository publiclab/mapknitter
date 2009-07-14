var ContextMenu = {
	cond_items: {},
	init: function() {
		this.menu = new Control.ContextMenu('canvas')
		this.menu.addItem({
				label: 'Edit GSS',
				callback: Cartagen.show_gss_editor
		})
		this.menu.addItem({
				label: 'Download Image',
				callback: Cartagen.redirect_to_image
		})
		this.menu.addItem({
				label: 'Download Data',
				callback: Interface.download_bbox
		})
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
	}
}

document.observe('cartagen:init', ContextMenu.init.bindAsEventListener(ContextMenu))
