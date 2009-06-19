/**
 * @namespace Stores information about the current viewport
 */
var Viewport = {
	/**
	 * Frame to show bbox culling
	 * @type Number
	 */
	padding: 0,
	/**
	 * Bbox in [y1, x1, y2, x2] format
	 * @type Number[]
	 */
	bbox: [],
	/**
	 * X-width of the viewport
	 * @type Number
	 */ 
	width: 0,
	/**
	 * Y-height of the viewport
	 */
	height: 0,
	/**
	 * Varies around 1.0 as function of hardware resolution. This assumes that resolution is
	 * somewhat proportianal to power, which is generally true. This should eventually be replaced
	 * with something that measures initial load speed in fps to get a better estimate.
	 * @type Number
	 */
	power: function() {
		return window.screen.width/1024
	}
}