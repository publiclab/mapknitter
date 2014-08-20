//= require jquery-ui/jquery-ui.min.js

jQuery(document).ready(function($) {
	$("#knitter-map-pane").droppable();
});

function addUploadedImageToSidebar($upload) {
	$("#warpables tbody").append($upload);
	$upload.find("img").draggable({ 
		helper: "clone",
		revert: "invalid"
	});
}