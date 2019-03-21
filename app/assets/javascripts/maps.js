//= require jquery-ui/jquery-ui.min.js
//= require knitter
//= require exif-js/exif.js
//= require mapknitter

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
      if (bounds) window.mapKnitter._map.fitBounds(bounds)
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

  var edit_comment = function(event) {
    var id = $(event.target).data("comment-id");
 
    /* Hide comment body. */
    $(".comment-body[data-comment-id=" + id + "]").toggle();
 
    /* Show comment editing form. */
    $(".comment-edit-form[data-comment-id=" + id + "]").toggle();
  }
  var delete_comment = function(event) {
    var id = $(event.target).data("comment-id");
 
    $(".comment[data-comment-id=" + id + "]").remove();
    $("#comments-number").text(function(i, str) { return str - 1; }); 
  }

  /* Enable dynamic comment editing. */
  $(".edit-comment-btn").click(edit_comment);

  /* Remove comment from the page when it is deleted from the database via AJAX. */
  $(".delete-comment-btn").click(delete_comment);

  /* on comment submission */
  $("#new_comment").on("ajax:success", function(e, data, status, xhr) {
    $("#new_comment button.btn-primary").html("Post comment").removeClass('disabled')
    $("#new_comment textarea").attr('disabled',false)
    $("#new_comment textarea").val('')

    $("#comments").append(xhr.responseText)
    $('.comment:last').click(edit_comment).click(delete_comment)
  }).on("ajax:error", function(e, xhr, status, error) {
    if (xhr.responseText == "Login required.") {
      window.location = "/login?back_to="+window.location
    } else {
      $("#new_comment button.btn-primary").html("Post comment").removeClass('disabled')
      $("#new_comment textarea").attr('disabled',false)
 
      $("#comments").append("<p class='alert alert-error'>There was an error.</p>")
    }
  })
  /* just before comment submission */
  $("#new_comment").on("ajax:beforeSend",function() {
    $("#new_comment button.btn-primary").html("<i class='fa fa-spinner fa-spin'></i>").addClass('disabled')
    $("#new_comment textarea").attr('disabled',true)
  })

  // display upload modal on drag-dropped image:
  $('#knitter-map-pane').on('dragenter',function(){
    $('#knitter-map-pane').addClass('dragover')
  })
  $('#knitter-map-pane').on('dragleave',function(){
    $('#knitter-map-pane').removeClass('dragover')
  })
  $('#knitter-map-pane').on('drop',function(){
    $('#uploadModal').modal('show')
    $('#knitter-map-pane').removeClass('dragover')
  })

});
