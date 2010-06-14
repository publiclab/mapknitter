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

var docName = "<document-title>"
var stitchWidth = <document-width>
var stitchHeight = <document-height>
var cmPerPixel = <cm-per-pixel>
var stitchDoc = app.documents.add(stitchWidth/300,stitchHeight/300, 300, docName, NewDocumentMode.RGB)
localPath = '.'

// ############## Main code begins here: ############## //


// Get list of warpables from Cartagen, with filenames and x,y for upper left corner
var warpables = <warps>

// for each warpable, do:
for (i=0;i<warpables.length;i++) {
	
	// Open warpable source image
	var fileRef = File(localPath + warpables[i][0])
	var sourceDoc = app.open(fileRef)

	// Select all
	sourceDoc.selection.selectAll()
	// selRef.feather ( "5px" );
	sourceDoc.selection.copy()
	sourceDoc.close()
	
	app.activeDocument = stitchDoc
	// Make a new layer in stitching doc
	stitchDoc.paste()

	// translate to position relative to upper left corner
	stitchDoc.selection.translate(warpables[i][1],warpables[i][2])
}

// ############## Main code ends here ############## //
