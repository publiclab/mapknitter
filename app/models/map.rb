require 'open3'
class Map < ActiveRecord::Base
  before_validation :update_name
  validates_presence_of :name,:author,:lat,:lon
  validates_uniqueness_of :name
  validates_presence_of :location, :message => ' cannot be found. Try entering a latitude and longitude if this problem persists.'
  validates_format_of       :name,
                            :with => /^[\w-]*$/,  
                            :message => " must not include spaces and must be alphanumeric, as it'll be used in the URL of your map, like: http://cartagen.org/maps/your-map-name. You may use dashes and underscores.",
                            :on => :create                  
#  validates_format_of :tile_url, :with => /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ix

  has_many :warpables
  has_many :exports
  has_many :tags

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

  def self.authors
    authors = []
    maps_authors = Map.find :all, :group => "maps.author", :conditions => ['password = "" AND archived = false']
    maps_authors.each do |map|
      authors << map.author
    end
    authors
  end

  def self.new_maps
    self.find(:all, :order => "created_at DESC", :limit => 12, :conditions => ['password = "" AND archived = false'])
  end

  def warpables
    Warpable.find :all, :conditions => {:map_id => self.id, :deleted => false} 
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
     Map.find(:all,:conditions => ['id != ? AND lat > ? AND lat < ? AND lon > ? AND lon < ?',self.id,self.lat-dist,self.lat+dist,self.lon-dist,self.lon+dist])
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
	average = (scales.inject {|sum, n| sum + n })/count if scales
	puts 'average scale = '+average.to_s+' cm/px'
        average
  end

  # composite in infrared data to make an NRG
  def composite(export_type,band_id)

    # create an export based on the last normal export and start tracking status:
    unless export = self.get_export(export_type) # searches only "normal" exports
	export = Export.new({:map_id => self.id,:status => 'starting'})
    end
	export.export_type = 'nrg'
	export.bands_string = 'nrg:'+band_id.to_s
	export.status = 'starting'
	export.tms = false
	export.geotiff = false
	export.zip = false
	export.jpg = false
	export.save

    band_map = Map.find(band_id)
    path = "public/warps/"+self.name+"/"
    band_path = "public/warps/"+band_map.name+"/"

    stdin, stdout, stderr = Open3.popen3('rm -r public/tms/'+self.name+"-nrg/")
	puts stdout.readlines
	puts stderr.readlines

    stdin, stdout, stderr = Open3.popen3('rm '+path+self.name+"-nrg.tif")
	puts stdout.readlines
	puts stderr.readlines

    stdin, stdout, stderr = Open3.popen3('rm '+path+self.name+"-nrg.jpg")
	puts stdout.readlines
	puts stderr.readlines

    gdalbuildvrt = "gdalbuildvrt "+path+self.name+"-nrg.vrt "+path+self.name+"-geo.tif "+band_path+band_map.name+"-geo.tif" 
    puts gdalbuildvrt
	system(Gdal.ulimit+gdalbuildvrt)

    # edit the XML file here - swap band #s and remove alpha layer
    #require "rexml/document"
    file = File.new( path+self.name+"-nrg.vrt" )
    doc = REXML::Document.new file
    bands = []
    #doc.elements.each('VRTDataset/VRTRasterBand/SimpleSource/SourceBand') do |n|
    # first, remove infrared SimpleSources from bands 2 and 3, visible from SimpleSource band 1
    index = 0
    doc.elements.each('VRTDataset/VRTRasterBand') do |rasterband|
	sourceindex = 0
	rasterband.elements.each('SimpleSource') do |source|
		if index == 0 # if R band
			if sourceindex == 0 # remove visible source
				source.remove
			else
				# leave infrared "red" band
				# ...but maybe this is wrong, we should blend all 3?
			end
		elsif index > 0 # if G,B,A band
			if sourceindex == 1 # remove infrared source
				source.remove 
			else
				source.elements.each("SourceBand") do |band|
					band.text = band.text.to_i-1 # decrement band 
				end
			end
		end
		sourceindex += 1
	end
	rasterband.remove if index == 3 # delete alpha band
	index += 1
    end

    # write VRT to log:
    # puts doc
    # Write the result back into the VRT file.
    formatter = REXML::Formatters::Default.new
    file = File.open( path+self.name+"-nrg.vrt", "w") do |f|
    	formatter.write(doc, f)
    end

    geotiff_location = path+self.name+"-nrg.tif"
    gdalwarp = "gdalwarp "+path+self.name+"-nrg.vrt "+geotiff_location
    puts gdalwarp
	system(Gdal.ulimit+gdalwarp)

	info = (`identify -quiet -format '%b,%w,%h' #{geotiff_location}`).split(',')
	puts info
	
	export = self.get_export(export_type)
	if info[0] != ''
		export.geotiff = true
		export.size = info[0]
		export.width = info[1]
		export.height = info[2]
		export.cm_per_pixel = 0 #100.0000/pxperm must get from gdalinfo?
		export.status = 'tiling'
		export.save
	end
	
    puts '> generating tiles'
    # make tiles:
    google_api_key = APP_CONFIG["google_maps_api_key"]
    gdal2tiles = 'gdal2tiles.py -k -t "'+self.name+'-nrg" -g "'+google_api_key+'" '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'-nrg.tif '+RAILS_ROOT+'/public/tms/'+self.name+"-nrg/"
#    puts gdal2tiles
#    puts system('which gdal2tiles.py')
    system(Gdal.ulimit+gdal2tiles)
	export.tms = true
        export.status = 'generating jpg'
	export.save
    export.jpg = true if self.generate_jpg("nrg")
      export.status = 'complete'
      export.save
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
        geotiff_location = directory+self.name+'-geo-merge.tif'
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
	self.warpables.each do |warpable|
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
	geotiff_location
  end
  
  # generates a tileset at RAILS_ROOT/public/tms/<map_name>/
  def generate_tiles
    google_api_key = APP_CONFIG["google_maps_api_key"]
    gdal2tiles = 'gdal2tiles.py -k -t "'+self.name+'" -g "'+google_api_key+'" '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'-geo.tif '+RAILS_ROOT+'/public/tms/'+self.name+"/"
#    puts gdal2tiles
#    puts system('which gdal2tiles.py')
    system(Gdal.ulimit+gdal2tiles)
  end

  # zips up tiles at RAILS_ROOT/public/tms/<map_name>.zip
  def zip_tiles
      rmzip = 'cd public/tms/ && rm '+self.name+'.zip && cd ../../'
      system(Gdal.ulimit+rmzip)
    zip = 'cd public/tms/ && zip -rq '+self.name+'.zip '+self.name+'/ && cd ../../'
#    puts zip 
#    puts system('which gdal2tiles.py')
    system(Gdal.ulimit+zip)
  end
 
  def generate_jpg(export_type)
	imageMagick = 'convert -background white -flatten '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'-geo.tif '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'.jpg' if export_type == "normal"
	imageMagick = 'convert -background white -flatten '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'-'+export_type+'.tif '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'-nrg.jpg' if export_type == "nrg"
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

end
