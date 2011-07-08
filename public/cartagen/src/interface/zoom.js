/**
 * @namespace Provides a non-scrollwheel zooming interface
 */
var Zoom = {
	initialize: function() {
		//Glop.observe('cartagen:postdraw', Zoom.draw.bindAsEventListener(this))
		Zoom.interval = 1.3
		$$('body')[0].insert("<div id='cartagen-controls'><style>#cartagen-controls { display:block;height:60px;width:30px;position:absolute;top:"+(18+(-1*Config.padding_top))+"px;right:8px;z-index:200; }#cartagen-controls a { display:block;height:30px;width:30px;text-decoration:none;text-align:center;color:white;background:#222;font-size:24px;font-style:bold;font-family:arial,sans-serif; }#cartagen-controls a:hover { background:#444; }#cartagen-controls a:active { background:#666; }</style><a href='javascript:void();' onClick='Map.zoom = Map.zoom*Zoom.interval;map.zoomIn()'>+</a><a href='javascript:void();' onClick='Map.zoom = Map.zoom*(1/1.3);map.zoomOut()'>-</a></div>")
	},
}

document.observe('cartagen:init', Zoom.initialize.bindAsEventListener(Zoom))
