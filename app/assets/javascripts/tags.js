jQuery(document).ready(function($) {
	/* Enable dynamic comment editing. */
	$(".edit-comment-btn").click(function(event) {
		var id = $(event.target).data("comment-id");

		/* Hide comment body. */
		$(".comment-body[data-comment-id=" + id + "]").toggle();

		/* Show comment editing form. */
		$(".comment-edit-form[data-comment-id=" + id + "]").toggle();
	});

	/* Remove comment from the page when it is deleted from the database via AJAX. */
	$(".delete-comment-btn").click(function(event) {
		var id = $(event.target).data("comment-id");

		$(".comment[data-comment-id=" + id + "]").remove();
		$("#comments-number").text(function(i, str) { return str - 1; }); 
	});
});