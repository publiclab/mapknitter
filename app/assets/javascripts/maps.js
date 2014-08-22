//= require jquery-ui/jquery-ui.min.js
//= require cartagen/cartagen
//= require knitter
//= require mapknitter

function addUploadedImageToSidebar($upload) {
	/* Modify the table row created by jQuery-File-Upload to remove unneeded cells. */
	$upload.find(".indicate").remove();
	$upload.find("td:last").remove();

	/* Add to sidebar. */
	jQuery(".warpables-all tbody").append($upload);
	makeDraggable($upload.find("img"));
}