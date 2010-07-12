/**
 * @namespace The 'Warp' tool and associated methods.
 */
Tool.Warp = {
	/**
	 * The tool mode can be 'drawing' when the user is in the process of adding 
	 * points to the polygon, or 'inactive' when a polygon has not yet begun.
	 */
	mode: 'default', //'rotate','drag','scale'
	/**
	 * Runs when this tool is selected; adds custom toolbar
	 */
	activate: function() {
		$('toolbars').insert('<div class=\'toolbar\' id=\'tool_specific\'></div>')
		$('tool_specific').insert('<a name=\'Delete this image\' class=\'first silk\' id=\'tool_warp_delete\'  href=\'javascript:void(0);\'><img src=\'/images/silk-grey/delete.png\' /></a>')
			$('tool_warp_delete').observe('mouseup',Tool.Warp.delete_image)
		$('tool_specific').insert('<a name=\'Lock this image\' class=\'silk\' id=\'tool_warp_lock\' href=\'javascript:void(0);\'><img src=\'/images/silk-grey/lock.png\' /></a>')
			$('tool_warp_lock').observe('mouseup',Tool.Warp.lock_image)
			if (Warper.active_image.locked) $('tool_warp_lock').addClassName('down')
		$('tool_specific').insert('<a name=\'Rotate/scale this image (r)\' class=\'\' id=\'tool_warp_rotate\' href=\'javascript:void(0);\'><img src=\'/images/tools/stock-tool-rotate-22.png\' /></a>')
			$('tool_warp_rotate').observe('mouseup',function(){Tool.Warp.mode = 'rotate'})
		$('tool_specific').insert('<a name=\'Revert this image to natural size\' class=\'silk\' id=\'tool_warp_revert\' href=\'javascript:void(0);\'><img src=\'/images/silk-grey/arrow_undo.png\' /></a>')
			$('tool_warp_revert').observe('mouseup',function(){Warper.active_image.set_to_natural_size();})
		$('tool_specific').insert('<a name=\'Distort this image by dragging corners (w)\' class=\'last\' id=\'tool_warp_default\' href=\'javascript:void(0);\'><img src=\'/images/tools/stock-tool-perspective-22.png\' /></a>')
			$('tool_warp_default').observe('mouseup',function(){Tool.Warp.mode = 'default'})
	},
	/**
	 * Runs when this tool is deselected; removes custom toolbar
	 */
	deactivate: function() {
		$('tool_specific').remove()
		Tool.Warp.mode = 'default'
		Warper.active_object = false
	},
	delete_image: function() {
		if (confirm('Are you sure you want to delete this image? You cannot undo this action.')) {
			Warper.images.each(function(image,index) {
				if (image.active && Warper.active_image == image) {
					Warper.images.splice(index,1)
					image.cleanup()
					new Ajax.Request('/warper/delete/'+image.id,{
						method:'post',
					})
				}
			})
			Tool.change('Pan')
		}
	},
	lock_image: function() {
		if (!Warper.active_image.locked) $('tool_warp_lock').addClassName('down')
		else $('tool_warp_lock').removeClassName('down')
		Warper.active_image.locked = !Warper.active_image.locked
		Warper.active_image.save()
	},
	/**
	 * 
	 */
	drag: function() {
	},
	/**
	 * Used to select objects in Warper
	 */
	mousedown: function() {
	}.bindAsEventListener(Tool.Warp),
	mouseup: function() {
		if (Warper.active_image) {
			if (Warper.active_image.active_point) {
				Warper.active_image.active_point.cancel_drag()
			} else {
				Warper.active_image.cancel_drag()
			}
		}
		$C.cursor('auto')
	}.bindAsEventListener(Tool.Warp),
	mousemove: function() {
		if (Mouse.down){
			if (Warper.active_image) {
				if (Warper.active_image.active_point) {
					Warper.active_image.active_point.drag()
				} else {
					Warper.active_image.drag()
				}
			}
		}
	}.bindAsEventListener(Tool.Warp),
	dblclick: function() {
				
	}.bindAsEventListener(Tool.Warp)	
}
