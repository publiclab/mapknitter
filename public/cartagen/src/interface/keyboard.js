/**
 * @namespace Stores information about the state of the keyboard
 */
var Keyboard = {
	/**
	 * Hash of keys and whether they are down
	 * @type Hash (String -> Boolean)
	 */
	keys: new Hash(),
	/**
	 * Whether Cartagen will be controlled by the keyboard
	 * @type Boolean
	 */
	key_input: false,
}
