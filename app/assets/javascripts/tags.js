jQuery(document).ready(function($) {
	/* Enable dynamic comment editing. */
	$(".edit-comment-btn").click(function(event) {
		/* 
		 * Has the form comment_<comment number>, e.g. comment_45s
		 */
		var id = event.target.id;

		/* Hide comment body. */
		$(".comment-body#body_" + id).toggle();

		/* Show comment editing form. */
		$(".comment-edit-form#edit_" + id).toggle();
	});
});