//= require jquery-ui/jquery-ui.min.js

jQuery(document).ready(function($) {
	$("#knitter-map-pane").droppable();
	makeDraggable($("#warpables tr img"));
});

function makeDraggable($selection) {
	$selection.draggable({ 
		helper: "clone",
		revert: "invalid"
	});
}

function addUploadedImageToSidebar($upload) {
	$("#warpables tbody").append($upload);
	makeDraggable($upload.find("img"));
}