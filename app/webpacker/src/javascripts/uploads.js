// iframe-transport is ajax file upload support for IE, Uncomment if needed      
// javascript_pack_tag  (file_upload + "js/jquery.iframe-transport")      

function addUploadedImageToSidebar($upload) {
  /* Modify the table row created by jQuery-File-Upload to remove unneeded cells. */
  //$upload.find(".indicate").remove();
  //$upload.find("td:last").remove();
  /* removing the above since we now want to be able to GPS-place them from within the modal */

  /* Add to sidebar. */
  jQuery(".warpables-all tbody").append($upload);
    $('#no-images').toggle();
}

jQuery(document).ready(function($) {

  $('#fileupload').fileupload({
    paramName:  'uploaded_data',
    autoUpload: 'true',
    acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
    maxFileSize: 10000000 
  });

  $(document).bind('drop dragover', function (e) {
    e.preventDefault();
  });

  $("#fileupload").fileupload({
    completed: function() {
      var latestFile = $("#uploaded-images-list tr:last").clone();

      addUploadedImageToSidebar(latestFile);
    }
  });
});

window.locale = {
  "fileupload": {
    "errors": {
      "maxFileSize": "File is too big",
      "minFileSize": "File is too small",
      "acceptFileTypes": "Filetype not allowed",
      "maxNumberOfFiles": "Max number of files exceeded",
      "uploadedBytes": "Uploaded bytes exceed file size",
      "emptyResult": "Empty file upload result"
    },
    "error": "Error",
    "start": "Start",
    "cancel": "Cancel",
    "destroy": "Delete"
  }
};
