require 'open3'
class Map < ActiveRecord::Base
  before_validation :update_name
  validates_presence_of :name,:author,:lat,:lon
  validates_uniqueness_of :name
  validates_presence_of :location, :message => ' cannot be found. Try entering a latitude and longitude if this problem persists.'
  validates_format_of   :name,
                        :with => /^[\w-]*$/,  
                        :message => " must not include spaces and must be alphanumeric, as it'll be used in the URL of your map, like: http://cartagen.org/maps/your-map-name. You may use dashes and underscores.",
                        :on => :create                  
#  validates_format_of :tile_url, :with => /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ix

  has_many :exports
  has_many :tags
  has_many :comments
  has_many :annotations

  has_many :warpables do 
    def public_filenames
      filenames = {}
      self.each do |warpable|
        filenames[warpable.id] = {}
        sizes = Array.new(Warpable::THUMBNAILS.keys).push(nil)
        sizes.each do |size|
          key = size != nil ? size : "original"
          filenames[warpable.id][key] = warpable.public_filename(size)
        end
      end
      filenames 
    end
  end

  def validate
    self.name != 'untitled'
    self.name = self.name.gsub(' ','-').gsub('_','-').downcase
    self.lat >= -90 && self.lat <= 90 && self.lon >= -180 && self.lat <= 180
  end

  # Hash the password before saving the record
  def before_create
    self.password = Password::update(self.password) if self.password != ""
  end

  def update_name
    self.name = self.name.gsub(/\W/, '-').downcase
  end

  def private
    self.password != ""
  end

  def self.bbox(minlat,minlon,maxlat,maxlon)
    Map.find :all, :conditions => ['lat > ? AND lat < ? AND lon > ? AND lon < ?',minlat,maxlat,minlon,maxlon]
  end

  def latest_export
    Export.find_by_map_id(self.id,:conditions => {:export_type => "normal"},:order => "created_at DESC")
  end

  # get latest export of export_type <export_type>, i.e. "normal", "nrg" or "ndvi"
  def get_export(export_type)
    Export.find_by_map_id(self.id,:conditions => {:export_type => export_type},:order => "created_at DESC")
  end

  def self.authors(limit = 50)
    Map.find(:all, :limit => limit, :group => "maps.author", :order => "id DESC", :conditions => ['password = "" AND archived = "false"']).collect(&:author)
  end

  def self.new_maps
    self.find(:all, :order => "created_at DESC", :limit => 12, :conditions => ['password = "" AND archived = "false"'])
  end

  def nodes
    nodes = {}
    self.warpables.each do |warpable|
      if warpable.nodes != ''
        w_nodes = []
        warpable.nodes.split(',').each do |node|
          node_obj = Node.find(node)
          w_nodes << [node_obj.lon,node_obj.lat]
        end
        nodes[warpable.id.to_s] = w_nodes
      end
      nodes[warpable.id.to_s] ||= 'none'
    end
    nodes
  end

  # find all other maps within <dist> degrees lat or lon
  def nearby_maps(dist)
    if self.lat.to_f == 0.0 || self.lon.to_f == 0.0
      return []
    else
      return Map.find(:all,:conditions => ['id != ? AND lat > ? AND lat < ? AND lon > ? AND lon < ?',self.id,self.lat-dist,self.lat+dist,self.lon-dist,self.lon+dist], :limit => 10)
    end
  end

  # Finds any warpables which have not been placed on the map manually, and deletes them.
  # Also returns remaining valid warpables.
  def flush_unplaced_warpables
    more_than_one_unplaced = false
    self.warpables.each do |warpable|
      if (warpable.nodes == "" && warpable.created_at == warpable.updated_at)
 # delete warpables which have not been placed and are older than 1 hour:
        warpable.delete if DateTime.now-5.minutes > warpable.created_at || more_than_one_unplaced
        more_than_one_unplaced = true
      end
    end
    warpables
  end 

  def average_scale
    # determine optimal zoom level
    puts '> calculating scale'
    pxperms = []
    self.warpables.each do |warpable|
      pxperms << 100.00/warpable.cm_per_pixel unless warpable.width.nil?
    end
    average = (pxperms.inject {|sum, n| sum + n })/pxperms.length
    puts 'average scale = '+average.to_s+' px/m'
    average
  end

  def best_cm_per_pixel
    hist = self.images_histogram
    scores = []
    (0..(hist.length-1)).each do |i|
      scores[i] = 0
      scores[i] += hist[i-3] if i > 3
      scores[i] += hist[i-2] if i > 2
      scores[i] += hist[i-1] if i > 1
      scores[i] += hist[i]
      scores[i] += hist[i+1] if i < hist.length - 2
      scores[i] += hist[i+2] if i < hist.length - 3
      scores[i] += hist[i+3] if i < hist.length - 4
    end
    highest = 0
    scores.each_with_index do |s,i|
      highest = i if s > scores[highest]
    end
    highest
  end

  def average_cm_per_pixel
    if self.warpables.length > 0
      scales = []
      count = 0
      average = 0
      self.warpables.each do |warpable|
        unless warpable.width.nil?
          count += 1
          res = warpable.cm_per_pixel 
          scales << res unless res == nil
        end
      end
      sum = (scales.inject {|sum, n| sum + n }) if scales
      average = sum/count if sum
      puts 'average scale = '+average.to_s+' cm/px'
      average
    else
      0
    end
  end

  # for sparklines graph display
  def images_histogram
    hist = []
    self.warpables.each do |warpable|
      res = warpable.cm_per_pixel.to_i
      hist[res] = 0 if hist[res] == nil 
      hist[res] += 1
    end
    (0..hist.length-1).each do |bin|
      hist[bin] = 0 if hist[bin] == nil
    end
    hist
  end

  # for sparklines graph display
  def grouped_images_histogram(binsize)
    hist = []
    self.warpables.each do |warpable|
      res = warpable.cm_per_pixel
      if res != nil
        res = (warpable.cm_per_pixel/(0.001+binsize)).to_i
        hist[res] = 0 if hist[res] == nil 
        hist[res] += 1
      end
    end
    (0..hist.length-1).each do |bin|
      hist[bin] = 0 if hist[bin] == nil
    end
    hist
  end

  # distort all warpables, returns upper left corner coords in x,y
  def distort_warpables(scale)
    export = self.latest_export
    puts '> generating geotiffs of each warpable in GDAL'
    lowest_x=0
    lowest_y=0
    warpable_coords = []
    warpables = self.warpables
    current = 0
    warpables.each do |warpable|
     current += 1
     export.status = 'warping '+current.to_s+' of '+warpables.length.to_s
     puts 'warping '+current.to_s+' of '+warpables.length.to_s
     export.save
     my_warpable_coords = warpable.generate_perspectival_distort(scale,self.name)
     puts '- '+my_warpable_coords.to_s
     warpable_coords << my_warpable_coords
     lowest_x = my_warpable_coords.first if (my_warpable_coords.first < lowest_x || lowest_x == 0)
     lowest_y = my_warpable_coords.last if (my_warpable_coords.last < lowest_y || lowest_y == 0)
    end
    [lowest_x,lowest_y,warpable_coords]
  end

  # generate a tiff from all warpable images in this set
  def generate_composite_tiff(coords,origin)
    directory = "public/warps/"+self.name+"/"
    composite_location = directory+self.name+'-geo.tif'
    geotiffs = ''
    minlat = nil
    minlon = nil
    maxlat = nil
    maxlon = nil
    self.warpables.each do |warpable|
      warpable.nodes_array.each do |n|
        minlat = n.lat if minlat == nil || n.lat < minlat
        minlon = n.lon if minlon == nil || n.lon < minlon
        maxlat = n.lat if maxlat == nil || n.lat > maxlat
        maxlon = n.lon if maxlon == nil || n.lon > maxlon
      end
    end
    first = true
    warpables = self.warpables.sort{|a,b|b.poly_area <=> a.poly_area}
    warpables.each do |warpable|
      geotiffs += ' '+directory+warpable.id.to_s+'-geo.tif'
      if first
        gdalwarp = "gdalwarp -te "+minlon.to_s+" "+minlat.to_s+" "+maxlon.to_s+" "+maxlat.to_s+" "+directory+warpable.id.to_s+'-geo.tif '+directory+self.name+'-geo.tif'
        first = false
      else
        gdalwarp = "gdalwarp "+directory+warpable.id.to_s+'-geo.tif '+directory+self.name+'-geo.tif'
      end
      puts gdalwarp
      system(Gdal.ulimit+gdalwarp)
    end
    composite_location
  end
  
  # generates a tileset at Rails.root.to_s/public/tms/<map_name>/
  def generate_tiles
    google_api_key = APP_CONFIG["google_maps_api_key"]
    gdal2tiles = 'gdal2tiles.py -k -t "'+self.name+'" -g "'+google_api_key+'" '+Rails.root.to_s+'/public/warps/'+self.name+'/'+self.name+'-geo.tif '+Rails.root.to_s+'/public/tms/'+self.name+"/"
#    puts gdal2tiles
#    puts system('which gdal2tiles.py')
    system(Gdal.ulimit+gdal2tiles)
  end

  # zips up tiles at Rails.root/public/tms/<map_name>.zip
  def zip_tiles
    rmzip = 'cd public/tms/ && rm '+self.name+'.zip && cd ../../'
    system(Gdal.ulimit+rmzip)
    zip = 'cd public/tms/ && zip -rq '+self.name+'.zip '+self.name+'/ && cd ../../'
    #    puts zip 
    #    puts system('which gdal2tiles.py')
    system(Gdal.ulimit+zip)
  end
 
  def generate_jpg(export_type)
    imageMagick = 'convert -background white -flatten '+Rails.root.to_s+'/public/warps/'+self.name+'/'+self.name+'-geo.tif '+Rails.root.to_s+'/public/warps/'+self.name+'/'+self.name+'.jpg' if export_type == "normal"
    imageMagick = 'convert -background white -flatten '+Rails.root.to_s+'/public/warps/'+self.name+'/'+self.name+'-'+export_type+'.tif '+Rails.root.to_s+'/public/warps/'+self.name+'/'+self.name+'-nrg.jpg' if export_type == "nrg"
    system(Gdal.ulimit+imageMagick)
  end
 
  def after_create
    puts 'saving Map'
    if last = Map.find_by_name(self.name,:order => "version DESC")
      self.version = last.version + 1
    end
  end

  def license_link
    if self.license == "cc-by"
     "<a href='http://creativecommons.org/licenses/by/3.0/'>Creative Commons Attribution 3.0 Unported License</a>" 
    elsif self.license == "publicdomain"
     "<a href='http://creativecommons.org/publicdomain/zero/1.0/'>Public Domain</a>"
    end
  end

  def polygons(dist)
    nodes = Node.find(:all,:conditions => ['lat > ? AND lat < ? AND lon > ? AND lon < ? AND way_id != 0 AND map_id != 0',self.lat-dist,self.lat+dist,self.lon-dist,self.lon+dist], :limit => 50, :order => "way_order DESC")
    Way.where('id IN (?)',nodes.collect(&:way_id).uniq)
  end

  #--------------------

  def has_tag(tagname)
    Tag.find(:all, :conditions => { :map_id => self.id, :name => tagname }).length > 0
  end

  def add_tag(tagname, user)
    tagname = tagname.downcase
    unless self.has_tag(tagname)
      tag = self.tags.create({
        :name => tagname,
        :user_id => user.id,
        :map_id => self.id 
      })
    end
  end
  
end
