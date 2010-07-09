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
		this.apply_default_styles()
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
		if (Config.vectors) {
		// Formerly drew separately to different canvases. 
		// That functionality has been put off for now.
		//
		// if (this.hover || this.mouseDown) {
		// 	// $l('main')
		// 	$C.open('main')
		// } else {
		// 	// $l('background')
		// 	$C.open('background')
		// }
		// $C.save()

		// apply styles

		$C.fill_style(this.fillStyle)

		if (this.pattern) {
			if (!this.pattern.src) {
				var value = this.pattern
				this.pattern = new Image()
				this.pattern.src = value
			}
			$C.fill_pattern(this.pattern, 'repeat')
		}

		$C.stroke_style(this.strokeStyle)
		$C.opacity(this.opacity)
		$C.line_width(this.lineWidth)

		// draw the shape
		this.shape()
		$C.restore()
		// $C.close()
		// draw label if we're zoomed in enough
		if (Map.zoom > 0.3) {
			Cartagen.queue_label(this.label, this.x, this.y)
		}
		}
	},
	/**
	 * By default, does nothing, but can be overriden to perform mouseDown and hover styling
	 */
	style: Prototype.emptyFunction,
	/**
	 * Abstract method that should be overridden to draw the feature.
	 */
	shape: function() {
		$D.warn('Feature#shape should be overriden')
	},
	apply_hover_styles: function() {
		$H(this.hover).each(function(pair) {
			if (this[pair.key]) this._unhovered_styles[pair.key] = this[pair.key]
			this[pair.key] = pair.value
		}, this)
	},
	remove_hover_styles: function() {
		Object.extend(this, this._unhovered_styles)
	},
	apply_click_styles: function() {
		$H(this.mouseDown).each(function(pair) {
			if (this[pair.key]) this._unclicked_styles[pair.key] = this[pair.key]
			this[pair.key] = pair.value
		}, this)
	},
	remove_click_styles: function() {
		Object.extend(this, this._unclicked_styles)
	},
	apply_default_styles: function() {
		this.fillStyle = 'rgba(0,0,0,0)'
		this.fontColor = '#eee'
		this.fontSize = 12
		this.fontRotation = 0
		this.opacity = 1
		this.strokeStyle = 'black'
		this.lineWidth = 6
		this._unhovered_styles = {}
		this._unclicked_styles = {}
	},
	get_type: function() {
		return this.__type__
	}
})

Object.extend(Feature, {
	/**
	 * Hash of node id => node
	 * @type Hash
	 */
	nodes: new Hash(),
	/**
	 * Hash of way id => way
	 * @type Way
	 */
	ways: new Hash(),
	/**
	 * Hash of relation id => relation
	 * @type Relation
	 */
	relations: new Hash()
})

//= require "types/node"
//= require "types/way"
//= require "types/relation"
//= require "types/label"

//= require "coastline"
//= require "importer"
