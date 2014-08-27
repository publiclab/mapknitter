//= require jquery-ui/jquery-ui.min.js
// require cartagen/cartagen
//= require knitter
//= require mapknitter

jQuery(document).ready(function($) {
	var sidebarNav = $(".knitter-side-pane .navbar-nav.sidebar-only");
		navLinks = $(".knitter-side-pane .navbar-nav.fullscreen-only").find("li");

	console.log(sidebarNav);
	console.log(navLinks);

	sidebarNav.find(".dropdown-menu").append(navLinks);
});

function addUploadedImageToSidebar($upload) {
	/* Modify the table row created by jQuery-File-Upload to remove unneeded cells. */
	$upload.find(".indicate").remove();
	$upload.find("td:last").remove();

	/* Add to sidebar. */
	jQuery(".warpables-all tbody").append($upload);
	makeDraggable($upload.find("img"));
}