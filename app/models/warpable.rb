class Warpable < ActiveRecord::Base

  has_attachment :content_type => :image, 
                 :storage => :s3, 
                 :max_size => 3.megabytes,
                 # :resize_to => '320x200>',
                 :thumbnails => { :medium => '500x375', :small => '240x180', :thumb => '100x100>' }

  validates_as_attachment

end
