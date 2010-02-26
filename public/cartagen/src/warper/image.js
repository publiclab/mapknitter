/**
 * A class for warpable raster images.
 * @class
 */
Warper.Image = Class.create(
{	
	/**
	 * The URI of the image resource to be warped
	 * @type String
	 * @default ""
	 */
	src: '',
	/**
	 * An array of ControlPoints of the corners of the image, starting from the top left and proceeding clockwise.
	 * @type Array
	 * @default "[[-100,100],[100,100],[100,-100],[-100,-100]]"
	 */
	corners: [
		[-100,100],
		[100,100],
		[100,-100],
		[-100,-100]
		],
}
)