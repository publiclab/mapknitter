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
		Tool.add_toolbar("tool_specific")
		//add_tool_specific_button(name,task,tooltip,icon,classes,init_tool)
		Tool.add_tool_specific_button("warp_delete",Tool.Warp.delete_image,"Delete this image","/images/silk-grey/delete.png","first silk")
		Tool.add_tool_specific_button("warp_revert",function(){Warper.active_image.set_to_natural_size();},"Revert to original proportions","/images/silk-grey/arrow_refresh.png","silk")
		Tool.add_tool_specific_button("warp_lock",Tool.Warp.lock_image,"Lock this image","/images/silk-grey/lock.png","silk")
		if (Warper.active_image.locked) $('tool_warp_lock').addClassName('down')
		Tool.add_tool_specific_button("warp_outline",function(){Warper.active_image.toggle_outline()},"Toggle image outline","/images/silk-grey/shape_move_backwards.png","silk")
		Tool.add_tool_specific_button("warp_transparent",function(){Warper.active_image.dblclick()},"Toggle image transparency","/images/silk-grey/contrast_low.png","silk")
		Tool.add_tool_specific_button("warp_rotate",function(){Tool.Warp.mode = 'rotate'},"Rotate/scale this image (r)","/images/tools/stock-tool-rotate-22.png",true)
		Tool.add_tool_specific_button("warp_distort",function(){Tool.Warp.mode = 'default'},"Distort this image by dragging corners (d)","/images/tools/stock-tool-perspective-22.png",true)
		Tool.add_tool_specific_button("warp_undo",function(){Warper.active_image.undo();},"Undo last image edit","/images/silk-grey/arrow_undo.png","silk last")
		$('tool_warp_distort').addClassName('down')
	},
	/**
	 * Runs when this tool is deselected; removes custom toolbar
	 */
	deactivate: function() {
		Tool.remove_toolbar("tool_specific")
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
