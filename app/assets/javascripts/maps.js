//= require jquery-ui/jquery-ui.min.js
//= require knitter
//= require mapknitter
//= require seiyria-bootstrap-slider/dist/bootstrap-slider.min.js

/* Move navbar links into dropdown if nav is inside the sidebar. */
jQuery(document).ready(function($) {
  window.toggle_sidebar = function(e){
    $('.sidebar').toggle()
    $('#knitter-map-pane').toggleClass('fullscreen')
    /* trigger a resize event */
    window.mapKnitter._map._onResize()
  }
  window.toggle_sidebar_and_fit_bounds = function(e){
    window.mapKnitter._map.once('resize',function(){
      window.mapKnitter._map.fitBounds(bounds)
    })
    window.toggle_sidebar()
  }


  $('.sidebar-toggle').click(window.toggle_sidebar_and_fit_bounds)

  haschat = false
  $('.chat-btn').click(function(){
    if (!haschat) {
      $('#chat').append('<iframe width="100%" height="300px" style="border:none;" src="https://webchat.oftc.net/?channels=publiclab&nick='+login+'"></iframe>')
    }
    haschat = true
  })
});
