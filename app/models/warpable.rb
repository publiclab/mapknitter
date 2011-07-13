require "open3"
require "ftools"

class Warpable < ActiveRecord::Base
  
  has_attachment :content_type => :image, 
		 #:storage => :file_system,:path_prefix => 'public/warpables', 
                 :storage => :s3, 
                 :max_size => 10.megabytes,
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
          errors.add_to_base("Images should be smaller than 10 MB in size")
        end
      end
        
    end

  end 

  def nodes_array
    Node.find self.nodes.split(',')
  end

  # pixels per meter = pxperm 
  def generate_perspectival_distort(pxperm,path)
    require 'net/http'
    
    working_directory = RAILS_ROOT+"/public/warps/"+path+"-working/"
    directory = RAILS_ROOT+"/public/warps/"+path+"/"
    Dir.mkdir(directory) unless (File.exists?(directory) && File.directory?(directory))
    Dir.mkdir(working_directory) unless (File.exists?(working_directory) && File.directory?(working_directory))

    local_location = working_directory+self.id.to_s+'-'+self.filename
    completed_local_location = directory+self.id.to_s+'.tif'
    geotiff_location = directory+self.id.to_s+'-geo-unwarped.tif'
    warped_geotiff_location = directory+self.id.to_s+'-geo.tif'

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

    # puts northmost.to_s+','+southmost.to_s+','+westmost.to_s+','+eastmost.to_s
    
    scale = 20037508.34    
    y1 = pxperm*Cartagen.spherical_mercator_lat_to_y(northmost,scale)
    x1 = pxperm*Cartagen.spherical_mercator_lon_to_x(westmost,scale)
    y2 = pxperm*Cartagen.spherical_mercator_lat_to_y(southmost,scale)
    x2 = pxperm*Cartagen.spherical_mercator_lon_to_x(eastmost,scale)
    # puts x1.to_s+','+y1.to_s+','+x2.to_s+','+y2.to_s

    if (self.public_filename[0..3] == 'http')
      Net::HTTP.start('s3.amazonaws.com') { |http|
      #Net::HTTP.start('localhost') { |http|
        resp = http.get(self.public_filename)
        open(local_location, "wb") { |file|
          file.write(resp.body)
        }
      }
    else
      File.copy(RAILS_ROOT+'/public'+self.public_filename,local_location)
    end

    points = ""
    coordinates = ""
    first = true
 
#EXIF orientation values: 
#Value	0th Row	0th Column
#1	top	left side
#2	top	right side
#3	bottom	right side
#4	bottom	left side
#5	left side	top
#6	right side	top
#7	right side	bottom
#8	left side	bottom
	
	rotation = (`identify -format %[exif:Orientation] #{local_location}`).to_i	
	#stdin, stdout, stderr = Open3.popen3('identify -format %[exif:Orientation] #{local_location}')
	#rotation = stdout.readlines.first.to_s.to_i
	#puts stderr.readlines

    if rotation == 6
      puts 'rotated CCW'
      source_corners = [[0,self.width],[0,0],[self.height,0],[self.height,self.width]]
    elsif rotation == 8
      puts 'rotated CW'
      source_corners = [[self.height,0],[self.height,self.width],[0,self.width],[0,0]]
    elsif rotation == 3
      puts 'rotated 180 deg'
      source_corners = [[self.height,self.width],[0,self.width],[0,0],[self.height,0]]
    else
      source_corners = [[0,0],[self.width,0],[self.width,self.height],[0,self.height]]
    end

    self.nodes_array.each do |node|
      corner = source_corners.shift
      nx1 = corner[0]
      ny1 = corner[1]
      nx2 = -x1+(pxperm*Cartagen.spherical_mercator_lon_to_x(node.lon,scale))
      ny2 = y1-(pxperm*Cartagen.spherical_mercator_lat_to_y(node.lat,scale))
   
      points = points + '  ' unless first
      points = points + nx1.to_s + ',' + ny1.to_s + ' ' + nx2.to_i.to_s + ',' + ny2.to_i.to_s
      first = false
      # we need to find an origin; find northwestern-most point
      coordinates = coordinates+' -gcp '+nx2.to_s+', '+ny2.to_s+', '+node.lon.to_s + ', ' + node.lat.to_s
    end

    height = (y1-y2).to_i.to_s
    width = (-x1+x2).to_i.to_s

	# http://www.imagemagick.org/discourse-server/viewtopic.php?f=1&t=11319
	# http://www.imagemagick.org/discourse-server/viewtopic.php?f=3&t=8764
	# read about equalization 
	# -equalize
	# -contrast-stretch 0

    #imageMagick = "convert -monitor -background transparent "
    imageMagick = "convert -background transparent "
    imageMagick += "-contrast-stretch 0 "
    imageMagick += local_location+" "
#    if rotation == 6 || rotation == 8
#    	imageMagick += "-crop "+width+"x"+height+"+0+0\! "
#    else
#    	imageMagick += "-crop "+height+"x"+width+"+0+0\! "
#    end
    if width > height
	imageMagick += "-crop "+width+"x"+width+"+0+0\! "
    else
	imageMagick += "-crop "+height+"x"+height+"+0+0\! "
    end
    imageMagick += "-background transparent -flatten "
    imageMagick += "-matte -virtual-pixel transparent "
    imageMagick += "-distort Perspective '"+points+"' "
    imageMagick += "+repage "
    imageMagick += completed_local_location
    puts imageMagick
	system(Gdal.ulimit+imageMagick)
	#stdin, stdout, stderr = Open3.popen3(imageMagick)
	#puts stdout.readlines
	#puts stderr.readlines

    gdal_translate = "gdal_translate -of GTiff -a_srs EPSG:4326 "+coordinates+'  -co "TILED=NO" '+completed_local_location+' '+geotiff_location
    puts gdal_translate
	system(Gdal.ulimit+gdal_translate)
	#stdin, stdout, stderr = Open3.popen3(gdal_translate)
	#puts stdout.readlines
	#puts stderr.readlines   
 
    gdalwarp = 'gdalwarp -srcnodata 255 -dstnodata 0 -cblend 30 -of GTiff -t_srs EPSG:4326 '+geotiff_location+' '+warped_geotiff_location
    puts gdalwarp
	system(Gdal.ulimit+gdalwarp)
	#stdin, stdout, stderr = Open3.popen3(gdalwarp)
	#puts stdout.readlines
	#puts stderr.readlines   
    
    [x1,y1]
  end

end


