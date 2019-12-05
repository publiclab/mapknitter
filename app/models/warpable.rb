class Warpable < ActiveRecord::Base
 
  attr_accessible :image
  attr_accessor :src, :srcmedium # for json generation

  # Paperclip; config and production/development specific configs
  # in /config/initializers/paperclip.rb
  has_attached_file :image,
    :s3_protocol => 'https',
    :styles => {
      :medium=> "500x375",
      :small=> "240x180",
      :thumb =>   "100x100>" }

  validates_attachment_content_type :image, :content_type => ["image/jpg", "image/jpeg", "image/png", "image/gif"]

  belongs_to :map
  belongs_to :user

  # overriding JSON formatting for Leaflet.DistortableImage
  def as_json(options = {})
    super options.merge(methods: [:src, :srcmedium])
  end

  # JSON formatting for file upload plugin
  def fup_json
   {"name" => read_attribute(:image_filename),
    "size" => read_attribute(:image_size),
    "url" => self.image.url(:medium),
    "original_url" => self.image.url(:original),
    "id" => self.read_attribute(:id),
    "thumbnail_url" => self.image.url(:thumb),
    "delete_url" => self.image.url,
    "delete_type" => "DELETE"}
  end

  def fup_error_json
   {"name" => read_attribute(:image_filename),
    "size" => read_attribute(:image_size),
    "error" => self.errors["base"]}                      
  end

  after_save :save_dimensions

  # this runs each time warpable is moved/distorted, 
  # to calculate resolution
  def save_dimensions
    if Rails.env.production?
      geo = Paperclip::Geometry.from_file(Paperclip.io_adapters.for(self.image.url)) # s3 version
    else
      geo = Paperclip::Geometry.from_file(Paperclip.io_adapters.for(self.image).path) # local filesystem version
    end

    #Rails >= v3.1 only
    self.update_column(:width, geo.width)
    self.update_column(:height, geo.height)
    #Rails >= v4.0 only
    #self.update_columns(attributes)
  end

  # if has non-nil width and has nodes, it's been placed.
  def placed?
    !self.width.nil? && self.nodes != ''
  end

  def poly_area
    area = 0
    nodes = self.nodes_array
    nodes.each_with_index do |node,index|
      if index < nodes.length-1
        nextnode = nodes[index+1]
      else
        nextnode = nodes[0]
      end
      if index > 0
        last = nodes[index-1]
      else
        last = nodes[nodes.length-1]
      end
      scale = 20037508.34
      # inefficient but workable, we don't use this that often:
 
          nodey = Cartagen.spherical_mercator_lat_to_y(node.lat,scale)
          nodex = Cartagen.spherical_mercator_lon_to_x(node.lon,scale)
          lasty = Cartagen.spherical_mercator_lat_to_y(last.lat,scale)
          lastx = Cartagen.spherical_mercator_lon_to_x(last.lon,scale)
          nexty = Cartagen.spherical_mercator_lat_to_y(nextnode.lat,scale)
          nextx = Cartagen.spherical_mercator_lon_to_x(nextnode.lon,scale)
      area += lastx*nodey-nodex*lasty+nodex*nexty-nextx*nodey
    end
    (area/2).abs
  end

  # crude measure based on image width, as resolution can vary 
  # across image if it's not flat on the earth
  def get_cm_per_pixel
    unless self.width.nil? || self.nodes == ''
      nodes = self.nodes_array
      # haversine might be more appropriate for large images
      scale = 20037508.34
          y1 = Cartagen.spherical_mercator_lat_to_y(nodes[0].lat,scale)
          x1 = Cartagen.spherical_mercator_lon_to_x(nodes[0].lon,scale)
          y2 = Cartagen.spherical_mercator_lat_to_y(nodes[1].lat,scale)
          x2 = Cartagen.spherical_mercator_lon_to_x(nodes[1].lon,scale)
      dist = Math.sqrt(((y2-y1)*(y2-y1))+((x2-x1)*(x2-x1)))
      scale = (dist*100)/(self.width) unless self.width.nil? || dist.nil?
    end
    scale
  end

  def self.histogram_cm_per_pixel
    w = Warpable.find :all, :conditions => ['cm_per_pixel != 0 AND cm_per_pixel < 500'], :order => "cm_per_pixel DESC"
    if w.length > 0
      hist = []
      (0..w.first.cm_per_pixel.to_i).each do |bin|
        hist[bin] = 0
      end
      w.each do |warpable|
        hist[warpable.cm_per_pixel.to_i] += 1
      end
      hist
    else
      []
    end
  end

  def nodes_array
    Node.find self.nodes.split(',')
  end

  # allow uploads via URL
  # needs update for Paperclip!!
  require 'open-uri'
  attr_reader :url
  def url=(uri)
    return nil if uri.blank?
    io = (open(URI.parse(uri)) rescue return nil)
    (class << io; self; end;).class_eval do
      define_method(:original_filename) { base_uri.path.split('/').last }
    end
    self.uploaded_data = io
  end

  # pixels per meter = pxperm 
  def generate_perspectival_distort(pxperm,path)
    require 'net/http'
    
    # everything in -working/ can be deleted; 
    # this is just so we can use the files locally outside of s3
    working_directory = self.working_directory(path)
    Dir.mkdir(working_directory) unless (File.exists?(working_directory) && File.directory?(working_directory))
    local_location = working_directory+self.id.to_s+'-'+self.image_file_name.to_s

    directory = self.warps_directory(path)
    Dir.mkdir(directory) unless (File.exists?(directory) && File.directory?(directory))
    completed_local_location = directory+self.id.to_s+'.png'

    # everything -masked.png can be deleted
    masked_local_location = directory+self.id.to_s+'-masked.png'
    # everything -mask.png can be deleted
    mask_location = directory+self.id.to_s+'-mask.png'
    #completed_local_location = directory+self.id.to_s+'.tif'
    # know everything -unwarped can be deleted
    geotiff_location = directory+self.id.to_s+'-geo-unwarped.tif'
    # everything -geo WITH AN ID could be deleted, but there is a feature request to preserve these
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

    # should determine if it's stored in s3 or locally:
    if (self.image.url[0..3] == 'http')
      Net::HTTP.start('s3.amazonaws.com') { |http|
      #Net::HTTP.start('localhost') { |http|
        puts (self.image.url)
        resp = http.get(self.image.url)
        open(local_location, "wb") { |file|
          file.write(resp.body)
        }
      }
    else
      require "fileutils"
      FileUtils.cp(Rails.root.to_s+'/public'+self.image.to_s,local_location)
    end

    points = ""
    maskpoints = ""
    coordinates = ""
    first = true
 
#EXIF orientation values: 
#Value  0th Row  0th Column
#1  top  left side
#2  top  right side
#3  bottom  right side
#4  bottom  left side
#5  left side  top
#6  right side  top
#7  right side  bottom
#8  left side  bottom
  
  rotation = (`identify -format %[exif:Orientation] #{local_location}`).to_i  
  #stdin, stdout, stderr = Open3.popen3('identify -format %[exif:Orientation] #{local_location}')
  #rotation = stdout.readlines.first.to_s.to_i
  #puts stderr.readlines

    if rotation == 6
      puts 'rotated CCW'
      source_corners = source_corners = [[0,self.height],[0,0],[self.width,0],[self.width,self.height]]
    elsif rotation == 8
      puts 'rotated CW'
      source_corners = [[self.width,0],[self.width,self.height],[0,self.height],[0,0]]
    elsif rotation == 3
      puts 'rotated 180 deg'
      source_corners = [[self.width,self.height],[0,self.height],[0,0],[self.width,0]]
    else
      source_corners = [[0,0],[self.width,0],[self.width,self.height],[0,self.height]]
    end

    maxdimension = 0

    self.nodes_array.each do |node|
      corner = source_corners.shift
      nx1 = corner[0]
      ny1 = corner[1]
      nx2 = -x1+(pxperm*Cartagen.spherical_mercator_lon_to_x(node.lon,scale))
      ny2 = y1-(pxperm*Cartagen.spherical_mercator_lat_to_y(node.lat,scale))
 
      points = points + '  ' unless first
      maskpoints = maskpoints + ' ' unless first
      points = points + nx1.to_s + ',' + ny1.to_s + ' ' + nx2.to_i.to_s + ',' + ny2.to_i.to_s
      maskpoints = maskpoints + nx2.to_i.to_s + ',' + ny2.to_i.to_s
      first = false
      # we need to find an origin; find northwestern-most point
      coordinates = coordinates+' -gcp '+nx2.to_s+', '+ny2.to_s+', '+node.lon.to_s + ', ' + node.lat.to_s
      
      # identify largest dimension to set canvas size for ImageMagick:
      maxdimension = nx1.to_i if maxdimension < nx1.to_i
      maxdimension = ny1.to_i if maxdimension < ny1.to_i
      maxdimension = nx2.to_i if maxdimension < nx2.to_i
      maxdimension = ny2.to_i if maxdimension < ny2.to_i
    end

    # close mask polygon:
    maskpoints = maskpoints + ' '
      nx2 = -x1+(pxperm*Cartagen.spherical_mercator_lon_to_x(self.nodes_array.first.lon,scale))
      ny2 = y1-(pxperm*Cartagen.spherical_mercator_lat_to_y(self.nodes_array.first.lat,scale))
    maskpoints = maskpoints + nx2.to_i.to_s + ',' + ny2.to_i.to_s

    height = (y1-y2).to_i.to_s
    width = (-x1+x2).to_i.to_s

  # http://www.imagemagick.org/discourse-server/viewtopic.php?f=1&t=11319
  # http://www.imagemagick.org/discourse-server/viewtopic.php?f=3&t=8764
  # read about equalization 
  # -equalize
  # -contrast-stretch 0

    imageMagick = "convert "
    imageMagick += "-contrast-stretch 0 "
    imageMagick += local_location+" "
    imageMagick += "-crop "+maxdimension.to_i.to_s+"x"+maxdimension.to_i.to_s+"+0+0! "
    imageMagick += "-flatten "
    imageMagick += "-distort Perspective '"+points+"' "
    imageMagick += "-flatten "
    if width > height
  imageMagick += "-crop "+width+"x"+width+"+0+0\! "
    else
  imageMagick += "-crop "+height+"x"+height+"+0+0\! "
    end
    imageMagick += "+repage "
    imageMagick += completed_local_location
    puts imageMagick
  system(Gdal.ulimit+imageMagick)

    # create a mask (later we can blur edges here)
    imageMagick2 = 'convert +antialias '
    if width > height
  imageMagick2 += "-size "+width+"x"+width+" "
    else
  imageMagick2 += "-size "+height+"x"+height+" "
    end
  # attempt at blurred edges in masking, but I've given up, as gdal_merge doesn't seem to respect variable-opacity alpha channels
      imageMagick2 += ' xc:none -draw "fill black stroke red stroke-width 30 polyline '
      imageMagick2 += maskpoints + '" '
      imageMagick2 += ' -alpha set -channel A -transparent red -blur 0x8 -channel R -evaluate set 0 +channel '+mask_location
    #imageMagick2 += ' xc:none -draw "fill black stroke none polyline '
    #imageMagick2 += maskpoints + '" '
    #imageMagick2 += ' '+mask_location
    puts imageMagick2
  system(Gdal.ulimit+imageMagick2)

    imageMagick3 = 'composite '+mask_location+' '+completed_local_location+' -compose DstIn -alpha Set '+masked_local_location
    puts imageMagick3
  system(Gdal.ulimit+imageMagick3)

    gdal_translate = "gdal_translate -of GTiff -a_srs EPSG:4326 "+coordinates+'  -co "TILED=NO" '+masked_local_location+' '+geotiff_location
    puts gdal_translate
  system(Gdal.ulimit+gdal_translate)
 
    #gdalwarp = 'gdalwarp -srcnodata "255" -dstnodata 0 -cblend 30 -of GTiff -t_srs EPSG:4326 '+geotiff_location+' '+warped_geotiff_location
    gdalwarp = 'gdalwarp -of GTiff -t_srs EPSG:4326 '+geotiff_location+' '+warped_geotiff_location
    puts gdalwarp
  system(Gdal.ulimit+gdalwarp)

    # deletions could happen here; do it in distinct method so we can run it independently
    self.delete_temp_files(path)

    [x1,y1]
  end

  def working_directory(path)
    "public/warps/"+path+"-working/"
  end

  def warps_directory(path)
    "public/warps/"+path+"/"
  end

  def delete_temp_files(path)
    system('rm -r '+self.working_directory(path))
    system('rm '+self.warps_directory(path)+'*.png')
  end

  def user_id
    Map.find self.map_id
    map.user_id
  end

  private

  # adjust filename behavior of Paperclip after migrating from attachment_fu 
  Paperclip.interpolates :custom_filename do |attachment, style|
    if style == :original
      custom_filename = basename(attachment,style) # generate hash path here
    else
      custom_filename = "#{basename(attachment,style)}_#{style}" # generate hash path here
    end

  end

end


