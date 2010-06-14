// This script opens a series of images from Cartagen with rotations and distorts already prepared.

// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// in case we double clicked the file
app.bringToFront();

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
$.level = 1;
// debugger; // launch debugger on next line

app.preferences.rulerUnits = Units.INCHES
app.preferences.typeUnits = TypeUnits.PIXELS
// app.preferences.pointSize = PointType.POSTSCRIPT

// ############## Configuration: ############## //

var docName = "Cartagen Export"
var stitchWidth = 2200
var stitchHeight = 2200
var cmPerPixel = 0 // auto-detects by default, add your own here to override
var stitchDoc = app.documents.add(stitchWidth/300,stitchHeight/300, 300, docName, NewDocumentMode.RGB)
localPath = '~/Desktop/grassrootsmapping/kentucky/adobe/images/'

// ############## Main code begins here: ############## //


// Get list of warpables from Cartagen, with filenames and x,y for 4 corners
var warpables = [
	// ['',[[x,y],[x,y],[x,y],[x,y]]]
	['IMG_0753.JPG',[[0,0],[1500,0],[1500,1500],[0,1500]]],
	['IMG_0777.JPG',[[500,0],[2000,500],[2000,2000],[500,2000]]],
	// ['IMG_0796.JPG',[[x,y],[x,y],[x,y],[x,y]]],
	// ['IMG_0799.JPG',[[x,y],[x,y],[x,y],[x,y]]]
]

// for each warpable, do:
for (i=0;i<warpables.length;i++) {
	
	// Open warpable source image
	var fileRef = File(localPath + warpables[i][0])
	var sourceDoc = app.open(fileRef)

	// Select all
	sourceDoc.selection.selectAll()
	sourceDoc.selection.copy()
	sourceDoc.close()
	
	app.activeDocument = stitchDoc
	// Make a new layer in stitching doc
	stitchDoc.paste()
	
	// translate to position relative to upper left corner
	
}

// ############## Main code ends here ############## //