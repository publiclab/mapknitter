//= require jquery-ui/jquery-ui.min.js
//= require knitter
//= require mapknitter
//= require seiyria-bootstrap-slider/dist/bootstrap-slider.min.js

/* Move navbar links into dropdown if nav is inside the sidebar. */
jQuery(document).ready(function($) {
  var sidebarNav = $(".sidebar .navbar-nav.sidebar-only"),
    navLinks = $(".sidebar .navbar-nav.fullscreen").find("li");

  sidebarNav.find(".dropdown-menu").append(navLinks);
  $('.sidebar-toggle').click(function(e){
    $('#knitter-map-pane').toggleClass('fullscreen')
    window.mapKnitter._map._onResize()
  })

  haschat = false
  $('.chat-btn').click(function(){
    if (!haschat) {
      $('#chat').append('<iframe width="100%" height="300px" style="border:none;" src="https://webchat.oftc.net/?channels=publiclab&nick='+login+'"></iframe>')
    }
    haschat = true
  })
});
