//= require jquery-ui/jquery-ui.min.js
// require cartagen/cartagen
//= require knitter
//= require mapknitter

/* Move navbar links into dropdown if nav is inside the sidebar. */
jQuery(document).ready(function($) {
	var sidebarNav = $(".sidebar .navbar-nav.sidebar-only"),
		navLinks = $(".sidebar .navbar-nav.fullscreen-only").find("li");

	sidebarNav.find(".dropdown-menu").append(navLinks);
	$('.sidebar-toggle').click(function(e){
		$('#knitter-map-pane').toggleClass('fullscreen')
		window.mapKnitter._map._onResize()
	})
});
