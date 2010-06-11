class Warpable < ActiveRecord::Base
  
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

  def nodes_array
    Node.find self.nodes.split(',')
  end
 
  def generate_affine_distort(scale)
    # convert IMG_0777.JPG -virtual-pixel Transparent -distort Affine '0,0, 100,100  3072,2304 300,300  3072,0 300,150  0,2304 150,1800' test.png
    require 'net/http'
    local_location = RAILS_ROOT+"/public/warps/"+self.id.to_s+'-'+self.filename
    completed_local_location = RAILS_ROOT+"/public/warps/"+self.id.to_s+'-completed-'+self.filename
    completed_local_location = completed_local_location[0..(completed_local_location.length-4)]+'png'

    northmost = self.nodes_array.first.lat
    southmost = self.nodes_array.first.lat
    westmost = self.nodes_array.first.lon
    eastmost = self.nodes_array.first.lon

    self.nodes_array.each do |node|
      northmost = node.lat if node.lat > northmost
      southmost = node.lat if node.lat < southmost
      westmost = node.lon if node.lon < westmost
      eastmost = node.lon if node.lon > eastmost
    end

    puts northmost.to_s+','+southmost.to_s+','+westmost.to_s+','+eastmost.to_s
    
    y1 = Cartagen.spherical_mercator_lat_to_y(northmost,scale)
    x1 = Cartagen.spherical_mercator_lon_to_x(westmost,scale)
    y2 = Cartagen.spherical_mercator_lat_to_y(southmost,scale)
    x2 = Cartagen.spherical_mercator_lon_to_x(eastmost,scale)
    puts x1.to_s+','+y1.to_s+','+x2.to_s+','+y2.to_s

    points = ""
    first = true
    source_corners = [[0,0],[self.width,0],[self.width,self.height],[0,self.height]]
    self.nodes_array.each do |node|
      corner = source_corners.shift
      nx1 = corner[0]
      ny1 = corner[1]
      # why the HELL should the following x10 be necessary??
      nx2 = (-x1+Cartagen.spherical_mercator_lon_to_x(node.lon,scale))*10
      ny2 = y1-Cartagen.spherical_mercator_lat_to_y(node.lat,scale)

      points = points + '  ' unless first
      points = points + nx1.to_s + ',' + ny1.to_s + ' ' + nx2.to_s + ',' + ny2.to_s
      first = false
      # we need to find an origin; find northwestern-most point
    end

    if (self.public_filename[0..3] == 'http')
      Net::HTTP.start() { |http|
        resp = http.get(self.public_filename)
        open(local_location, "wb") { |file|
          file.write(resp.body)
        }
      }
    else
      File.copy(RAILS_ROOT+'/public'+self.public_filename,local_location)
    end
    puts points
    imageMagick = "convert "+local_location+" -matte -virtual-pixel transparent -distort Perspective '"+points+"' -crop "+(10*(-x1+x2)).to_s+"x"+(y1-y2).to_s+"+0+0 "+completed_local_location
    puts imageMagick
    system(imageMagick)
    #warped Warped.new({:url => ''})
    # eventually store in s3    
  end

end


