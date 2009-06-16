//= require "geohash"
//= require "style"

/**
 * A abstract base class for map features - nodes and ways. Should not be
 * instantiated.
 * @class
 */
var Feature = Class.create(
/** 
 * @lends Feature.prototype 
 */
{
	/**
	 * Sets defaults for tags, fillStyle, fontColor fontSize, and fontRotation
	 * @constructs
	 */
	initialize: function() {
		this.tags = new Hash()
		this.fillStyle = '#555'
		this.fontColor = '#eee'
		this.fontSize = 12
		this.fontRotation = 0
	},
	/**
	 * Draws this feature using shape(). Saves/restores the canvas and applies styles.
	 */
	draw: function() {
		Cartagen.object_count++
		canvas.save()
		Style.apply_style(this)
		this.shape()
		canvas.restore()
	},
	/**
	 * Abstract method that should be overridden to draw the feature.
	 */
	shape: function() {
		Cartagen.debug('WARNING: Feature#shape should be overriden')
	}
})

//= require "node"
//= require "way"
//= require "label"
