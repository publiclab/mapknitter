//= require jquery-ui/jquery-ui.min.js
// require cartagen/cartagen
//= require knitter
//= require mapknitter

/* Move navbar links into dropdown if nav is inside the sidebar. */
jQuery(document).ready(function($) {
	var sidebarNav = $(".knitter-side-pane .navbar-nav.sidebar-only"),
		navLinks = $(".knitter-side-pane .navbar-nav.fullscreen-only").find("li");

	sidebarNav.find(".dropdown-menu").append(navLinks);
});