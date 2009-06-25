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

		/**
		 * Label for this way
		 * @type Label
		 */
		this.label = new Label(this)
	},
	/**
	 * Draws this feature using shape(). Saves/restores the canvas and applies styles. Queues
	 * this feature's label in the label drawing queue.
	 */
	draw: function() {
		Cartagen.object_count++
		$C.save()
		Style.apply_style(this)
		this.shape()
		$C.restore()

		// draw label if we're zoomed in enough
		if (Cartagen.zoom_level > 0.3) {
			Cartagen.queue_label(this.label, this.x, this.y)
		}
	},
	/**
	 * Abstract method that should be overridden to draw the feature.
	 */
	shape: function() {
		$D.warn('Feature#shape should be overriden')
	}
})

//= require "node"
//= require "way"
//= require "label"
