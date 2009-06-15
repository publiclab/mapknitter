/**
 * @namespace
 */
var Viewport = {
	padding: 0, // frame to show bbox culling
	// x,y bbox
	bbox: [],
	// in-map x-width (after scaling)
	width: 0,
	// in-map y-height (after scaling)
	height: 0,
	// varies around 1.0 as function of hardware resolution: larger screens ~= powerfuller devices
	// we could also tie to framerate based on measurement of initial load using Date object and frame count
	power: function() {
		return window.screen.width/1024
	}
}