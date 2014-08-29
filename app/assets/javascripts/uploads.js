//= require blueimp-tmpl/js/tmpl.js
//= require blueimp-file-upload/js/vendor/jquery.ui.widget
//= require blueimp-file-upload/js/jquery.fileupload
//= require blueimp-file-upload/js/jquery.fileupload-process
//= require blueimp-file-upload/js/jquery.fileupload-ui

// iframe-transport is ajax file upload support for IE, Uncomment if needed      
// javascript_include_tag  (file_upload + "js/jquery.iframe-transport")      

// need this so that jQuery draggable is attached to jQuery objects (for use in map views)
//= require jquery-ui/jquery-ui.min.js

//= require uploads-gps-exif

jQuery(document).ready(function($) {

    $('#fileupload').fileupload({
        paramName:  'warpable[uploaded_data]',
        autoUpload: 'true',
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: 10000000 
    });
        
    $('#fileupload').on('fileuploaddone', function (e, data) {
        EXIF.getData(data.files[0], function() {
            var GPS = EXIF.getGPSTags(this), 
                checked = $("#allowAutoPlacement").attr("checked"),
                autoPlacementAllowed = checked === "checked" ? false : true,
                latLngDefined = typeof GPS["GPSLatitude"] !== 'undefined' 
                    && typeof GPS["GPSLongitude"] !== 'undefined',
                latitude, longitude;

            if(latLngDefined) {
                $("#GPS_" + data.result.files[0].id).css("display","");
            }

            if (typeof window.FileReader !== 'function') {

                //We cannot correct image based on altitude if the image dimensions are not known.
                console.log("File API is not supported by this browser");

                if(autoPlacementAllowed) {
                    parent.Warper.new_image_GPS(
                        data.result.files[0].url, 
                        data.result.files[0].id, 
                        GPS
                    );
                } else {
                    parent.Warper.new_image(
                        data.result.files[0].url,
                        data.result.files[0].id,
                        true
                    );                     
                }                
            }

            else {
                var reader  = new FileReader();

                reader.onload = function(e) {
                    var image = new Image();

                    image.onload = function() { placeImage(); };
                    image.src = e.target.result;
                };
            }
            reader.readAsDataURL(data.files[0]);

            function placeImage() {
                var hasAltitude = typeof GPS["GPSAltitude"] !== "undefined" 
                        && typeof GPS["GPSAltitudeRef"] !== "undefined";

                if(hasAltitude) {
                    if(autoPlacementAllowed) {
                        parent.Warper.new_image_GPS(
                            data.result.files[0].url, 
                            data.result.files[0].id, 
                            GPS, 
                            this.height, 
                            this.width
                        );
                    } else {
                        parent.Warper.new_image(
                            data.result.files[0].url,
                            data.result.files[0].id,
                            true
                        ); 
                    }
                }
            };

        }); 
    });

    $(document).bind('drop dragover', function (e) {
        e.preventDefault();
    });

    /* 
     * IF page is being viewed through an iframe, add the image preview and details
     * to the sidebar in the parent page.
     */
    if (window.parent) {
        window.addUploadedImageToSidebar = window.parent.addUploadedImageToSidebar;
    }

    $("#fileupload").fileupload({
        completed: function() {
            if (addUploadedImageToSidebar) {
                var latestFile = $("#uploaded-images-list tr:last").clone();

                addUploadedImageToSidebar(latestFile);
            }
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
