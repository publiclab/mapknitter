/**
 * @namespace Stores information about the state of the mouse
 */
var Mouse = {
	/**
	 * X-coordiante of the mouse
	 * @type Number
	 */
	x: 0,
	/**
	 * Y-coordinate of the mouse
	 * @type Number
	 */
	y: 0,
	/**
	 * Whether the mouse is down
	 * @type Boolean
	 */
	down: false,
	/**
	 * Whether the mouse is up
	 * @type Boolean
	 */
	up: false,
	/**
	 * X-coordinate of the last click
	 * @type Number
	 */
	click_x: 0,
	/**
	 * Y-coordinate of the last click
	 * @type Number
	 */
	click_y: 0,
	/**
	 * The frame of the last time the mouse was clicked
	 * @type Number
	 */
	click_frame: 0,
	/**
	 * The frame of the last time the mouse was released
	 * @type Number
	 */
	release_frame: null,
	/**
	 * Whether the map is being dragged
	 * @type Boolean
	 */
	dragging: false,
	/**
	 * Length of the drag in the X-direction
	 * @type Number
	 */
	drag_x: null,
	/**
	 * Length of the drag in the Y-direction
	 * @type Number
	 */
	drag_y: null,
	hovered_features: []
}