class Warp < ActiveRecord::Base

  has_attachment :content_type => :image, 
		 :storage => :file_system,:path_prefix => 'public/warpables', 
                 #:storage => :s3, 
                 :max_size => 5.megabytes,
                 # :resize_to => '320x200>',
		:processor => :image_science,
                 :thumbnails => { :medium => '500x375', :small => '240x180', :thumb => '100x100>' }

  # validates_as_attachment

  def validate
    errors.add_to_base("You must choose a file to upload") unless self.filename
    
    unless self.filename == nil
      
      # Images should only be GIF, JPEG, or PNG
      [:content_type].each do |attr_name|
        enum = attachment_options[attr_name]
        unless enum.nil? || enum.include?(send(attr_name))
          errors.add_to_base("You can only upload images (GIF, JPEG, or PNG)")
        end
      end
      
      # Images should be less than 5 MB
      [:size].each do |attr_name|
        enum = attachment_options[attr_name]
        unless enum.nil? || enum.include?(send(attr_name))
          errors.add_to_base("Images should be smaller than 5 MB in size")
        end
      end
        
    end
  end

  def url=(value) 
    self.uploaded_data = UrlUpload.new(value)
  end

end


require 'open-uri'

# Make it always write to tempfiles, never StringIO
OpenURI::Buffer.module_eval {
  remove_const :StringMax
  const_set :StringMax, 0
}

class UrlUpload
    EXTENSIONS = {
      "image/jpeg" => ["jpg", "jpeg", "jpe"],
      "image/gif" => ["gif"],
      "image/png" => ["png"]
    }
    attr_reader :original_filename, :attachment_data
    def initialize(url)
      @attachment_data = open(url)
      @original_filename = determine_filename
    end

    # Pass things like size, content_type, path on to the downloaded file
    def method_missing(symbol, *args)
      if self.attachment_data.respond_to? symbol
        self.attachment_data.send symbol, *args
      else
        super
      end
    end
    
    private
      def determine_filename
        # Grab the path - even though it could be a script and not an actual file
        path = self.attachment_data.base_uri.path
        # Get the filename from the path, make it lowercase to handle those
        # crazy Win32 servers with all-caps extensions
        filename = File.basename(path).downcase
        # If the file extension doesn't match the content type, add it to the end, changing any existing .'s to _
        filename = [filename.gsub(/\./, "_"), EXTENSIONS[self.content_type].first].join(".") unless EXTENSIONS[self.content_type].any? {|ext| filename.ends_with?("." + ext) }
        # Return the result
        filename
      end
  end

