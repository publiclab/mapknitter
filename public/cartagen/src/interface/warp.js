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
		$('tool_specific').insert('<a class=\'first silk\' id=\'tool_warp_delete\'  href=\'javascript:void(0);\'><img src=\'/images/silk-grey/delete.png\' /></a>')
			$('tool_warp_delete').observe('mouseup',Tool.Warp.delete_image)
		$('tool_specific').insert('<a class=\'\' id=\'tool_warp_rotate\' href=\'javascript:void(0);\'><img src=\'/images/tools/stock-tool-rotate-22.png\' /></a>')
			$('tool_warp_rotate').observe('mouseup',function(){Tool.Warp.mode = 'rotate'})
		$('tool_specific').insert('<a class=\'last\' id=\'tool_warp_default\' href=\'javascript:void(0);\'><img src=\'/images/tools/stock-tool-perspective-22.png\' /></a>')
			$('tool_warp_default').observe('mouseup',function(){Tool.Warp.mode = 'default'})
	},
	/**
	 * Runs when this tool is deselected; removes custom toolbar
	 */
	deactivate: function() {
		$('tool_specific').remove()
		Tool.Warp.mode = 'default'
	},
	delete_image: function() {
		console.log('deleting image')
		Warper.images.each(function(image,index) {
			if (image.active) {
				console.log(index+' deleting')
				Warper.images.splice(index,1)
				image.cleanup()
				new Ajax.Request('/warper/delete/'+image.id,{
					method:'post',
				})
			}
		})
		Tool.change('Pan')
	},
	/**
	 * 
	 */
	drag: function() {
		
	},
	mousedown: function() {
	}.bindAsEventListener(Tool.Warp),
	mouseup: function() {
		$l('Warp mouseup')
		
	}.bindAsEventListener(Tool.Warp),
	mousemove: function() {
		$l('Warp mousemove')
		
	}.bindAsEventListener(Tool.Warp),
	dblclick: function() {
		$l('Warp dblclick')
				
	}.bindAsEventListener(Tool.Warp)	
}
