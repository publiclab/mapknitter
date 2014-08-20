//= require jquery-ui/jquery-ui.min.js

jQuery(document).ready(function($) {
	$("#knitter-map-pane").droppable({
		drop: function(event, ui) {
			var img = ui.draggable,
				url = $(img).attr("src");
			L.imageOverlay(url, [[40.712216, -74.22655], [40.773941, -74.12544]]).addTo(map);
		}
	});
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