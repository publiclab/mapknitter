//= require jquery-ui/jquery-ui.min.js

jQuery(document).ready(function($) {
	$(".knitter-map-pane").droppable();
	makeDraggable($(".warpables-all tr img"));
});

function makeDraggable($selection) {
	$selection.draggable({ 
		helper: "clone",
		revert: "invalid"
	});
}

function addUploadedImageToSidebar($upload) {
	/* Modify the table row created by jQuery-File-Upload to remove unneeded cells. */
	$upload.find(".indicate").remove();
	$upload.find("td:last").remove();

	/* Add to sidebar. */
	$(".warpables-all tbody").append($upload);
	makeDraggable($upload.find("img"));
}