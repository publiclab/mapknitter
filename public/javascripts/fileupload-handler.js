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
       $(function () {
          // Initialize the jQuery File Upload widget:
        $('#fileupload').fileupload({      // Change the default parameters name from files[]
          paramName:  'warpable[uploaded_data]',
          autoUpload: 'true',
          acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
          maxFileSize: 10000000 });
        formData = $('form').serializeArray(); 
          
          $.getJSON($('#fileupload').prop('action'), function (files) {
    
            var GPS = EXIF.getGPSTags(this), latitude, longitude; 
            var fu = $('#fileupload').data('blueimpFileupload'), 
              template;
           // fu._adjustMaxNumberOfFiles(-files.length);
            template = fu._renderDownload(files)
              .appendTo($('#fileupload .files'));
            // Force reflow:
            fu._reflow = fu._transition && template.length &&
              template[0].offsetWidth;
            template.addClass('in');
    
            $('#loading').remove();
    
          });
    
    
          $('#fileupload').bind('fileuploaddone', function (e, data) { 
            EXIF.getData(data.files[0], function(){
              var GPS = EXIF.getGPSTags(this), latitude, longitude; 
            
              if(typeof GPS["GPSLatitude"] !== 'undefined' && typeof GPS["GPSLongitude"] !== 'undefined' )
                data.result.files[0].gps = true;
              if (typeof window.FileReader !== 'function') {
                //We cannot correct image based on altitude if the image dimensions are not known.
                console.log("File API is not supported by this browser");
    
                latitude = (GPS["GPSLatitude"][0]) + (GPS["GPSLatitude"][1]/60) + (GPS["GPSLatitude"][2]/3600);
                longitude = (GPS["GPSLongitude"][0]) + (GPS["GPSLongitude"][1]/60) + (GPS["GPSLongitude"][2]/3600);
                parent.Warper.new_image_GPS(data.result.files[0].url, data.result.files[0].id, GPS);
                }
    
            else{
                var reader  = new FileReader();
                reader.onload   = function(e){
                    var image   = new Image();
                    image.onload    = function(){
    
                        //Place with GPS data if available
                        if(typeof GPS["GPSLatitude"] !== 'undefined' && typeof GPS["GPSLongitude"] !== 'undefined' ){
                            latitude = (GPS["GPSLatitude"][0]) + (GPS["GPSLatitude"][1]/60) + (GPS["GPSLatitude"][2]/3600);
                            longitude = (GPS["GPSLongitude"][0]) + (GPS["GPSLongitude"][1]/60) + (GPS["GPSLongitude"][2]/3600);
                            parent.Warper.new_image_GPS(data.result.files[0].url, data.result.files[0].id, GPS, this.height, this.width);
                            }
                        //Fallback to regular placement.  
                        else{
                          	parent.Warper.new_image(data.result.files[0].url,data.result.files[0].id,true); 
                            }
                        };
                    image.src = e.target.result;
                    };
                }
            reader.readAsDataURL(data.files[0]);
              }); 
          });
          $(document).bind('drop dragover', function (e) {
                e.preventDefault();
                });
      });

        
