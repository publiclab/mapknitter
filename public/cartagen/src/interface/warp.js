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
		console.log('activate')
		$('toolbars').insert("<div class='toolbar' id='tool_specific'><a class='first silk' href='javascript:void(0);' onClick='Tool.Warp.delete_image();'><img src='/images/silk-grey/delete.png' /></a><a class='' href='javascript:void(0);' onClick='Tool.Warp.mode = \'scale\''><img src='/images/tools/stock-tool-rotate-22.png' /></a><a class='last' href='javascript:void(0);' onClick='Tool.Warp.mode = \'rotate\''><img src='/images/tools/stock-tool-scale-22.png' /></a></div>")
	},
	/**
	 * Runs when this tool is deselected; removes custom toolbar
	 */
	deactivate: function() {
		$('tool_specific').remove()
	},
	delete_image: function() {
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
