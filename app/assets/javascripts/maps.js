//= require jquery-ui/jquery-ui.min.js

jQuery(document).ready(function($) {
	$("#knitter-map-pane").droppable({ drop: placeImage });
	makeDraggable($(".warpables-all tr img"));
});

function placeImage(event, ui) {
	var img = ui.draggable,
		url = $(img).attr("src");
	L.imageOverlay(url, [[40.712216, -74.22655], [40.773941, -74.12544]]).addTo(map);
}

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

function initializeLeaflet(latlng, zoom) {
	var center = L.latLng(latlng),
		map = L.map('knitter-map-pane', { zoomControl: false })
			.setView(center, zoom),
		drawnItems = new L.FeatureGroup().addTo(map),
		zoomControl = L.control.zoom({ position: 'topright' }).addTo(map),
		illustrateControl = new L.Illustrate.Control({
			position: 'topright',
			edit: { featureGroup: drawnItems }
		}).addTo(map),
		drawControl = new L.Control.Draw({
			position: 'topright',
			edit: { featureGroup: drawnItems }
		}).addTo(map);

	L.tileLayer.provider('Esri.WorldImagery').addTo(map);	
}