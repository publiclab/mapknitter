class Map < ActiveRecord::Base
  before_validation :update_name
  validates_presence_of :name,:author
  validates_presence_of :location, :message => ' cannot be found. Try entering a latitude and longitude if this problem persists.'
  validates_format_of       :name,
                            :with => /[a-zA-Z0-9_-]/,  
                            :message => " must not include spaces and must be alphanumeric, as it'll be used in the URL of your map, like: http://cartagen.org/maps/your-map-name. You may use dashes and underscores.",
                            :on => :create                  
#  has_many :warpables

  def update_name
    self.name = self.name.gsub(/\W/, '-').downcase
  end

  def validate
    self.name != 'untitled'
  end

  def warpables
    Warpable.find :all, :conditions => {:map_id => self.id, :deleted => false} 
  end

  def average_scale
	# determine optimal zoom level
	puts '> calculating scale'
	pxperms = []
	self.warpables.each do |warpable|
		unless warpable.width.nil?
			nodes = warpable.nodes_array
			# haversine might be more appropriate for large images
			scale = 20037508.34
    			y1 = Cartagen.spherical_mercator_lat_to_y(nodes[0].lat,scale)
    			x1 = Cartagen.spherical_mercator_lon_to_x(nodes[0].lon,scale)
    			y2 = Cartagen.spherical_mercator_lat_to_y(nodes[1].lat,scale)
    			x2 = Cartagen.spherical_mercator_lon_to_x(nodes[1].lon,scale)
			dist = Math.sqrt(((y2-y1)*(y2-y1))+((x2-x1)*(x2-x1)))
			puts 'x1,y1: '+x1.to_s+','+y1.to_s+' x2,y2: '+x2.to_s+','+y2.to_s
			puts (x2-x1).to_s+','+(y2-y1).to_s
			pxperms << (warpable.width)/dist
			puts 'scale: '+pxperms.last.to_s+' & dist: '+dist.to_s
		end
	end

	average = (pxperms.inject {|sum, n| sum + n })/pxperms.length
	puts 'average scale = '+average.to_s
        average
  end

  # distort all warpables, returns upper left corner coords in x,y
  def distort_warpables(scale)
	puts '> generating perspectival distorts of each warpable in ImageMagick'
	lowest_x=0
	lowest_y=0
	warpable_coords = []
	self.warpables.each do |warpable|
		my_warpable_coords = warpable.generate_perspectival_distort(scale,self.name)
		puts '- '+my_warpable_coords.to_s
		warpable_coords << my_warpable_coords
		lowest_x = my_warpable_coords.first if (my_warpable_coords.first < lowest_x || lowest_x == 0)
		lowest_y = my_warpable_coords.last if (my_warpable_coords.last < lowest_y || lowest_y == 0)
	end
	[lowest_x,lowest_y,warpable_coords]
  end

  def generate_composite_tiff(coords,origin)
	tif_string = 'convert -monitor '
	for i in 0..self.warpables.length-1 do
		x = (coords[i][0]-origin[0]).to_i.to_s
		y = (coords[i][1]-origin[1]).to_i.to_s
		tif_string += " -page +"+x+"+"+y+" "+RAILS_ROOT+"/public/warps/"+self.name+"/"+self.warpables[i].id.to_s+".tif"
	end
	tif_string += " "+RAILS_ROOT+"/public/warps/"+self.name+".tif"

	# warn that it might take a while

	puts '- '+tif_string
	system(tif_string)
	puts 'complete!'
  end

  def zip
	path = RAILS_ROOT+"/public/warps/"+self.name+"/"
	gem 'rubyzip'
	require 'zip/zip'
	require 'zip/zipfilesystem'

	path.sub!(%r[/$],'')
	archive = File.join(RAILS_ROOT+'/public/warps/',File.basename(path))+'.zip'
	FileUtils.rm archive, :force=>true

	Zip::ZipFile.open(archive, 'w') do |zipfile|
		Dir["#{path}/**/**"].reject{|f|f==archive}.each do |file|
			zipfile.add(file.sub(path+'/',''),file)
		end
	end

	system('chmod a+r '+archive)
  end

  # generates a geotiff from an existing tiff, referencing the map warpable coordinates
  def generate_geotiff
    coordinates = ' '
    self.warpables.each do |warpable|
      warpable.nodes_array.each do |node|
        x = 0
        y = 0
        # this ordering may be wrong:
        coordinates = coordinates+' -gcp '+x.to_s+' '+y.to_s+' '+node.lat.to_s + ' ' + node.lon.to_s
      end
    end
    
    gdal_translate = 'gdal_translate -of GTiff -a_srs EPSG:4326 '+coordinates+'  -co "TILED=NO" '+RAILS_ROOT+'/public/warps/'+self.name+'.tif '+RAILS_ROOT+'/public/warps/'+self.name+'.tif'
    gdalwarp = 'gdalwarp -of GTiff -t_srs EPSG:4326 '+RAILS_ROOT+'/public/warps/'+self.name+'.tif '+RAILS_ROOT+'/public/warps/'+self.name+'.tif'

    puts gdal_translate
    system(gdal_translate)
    puts gdalwarp
    system(gdalwarp)
  end

  # generates a tileset at RAILS_ROOT/public/tiles/<map_name>/
  def generate_tiles
    # get google api key from /config/google_api.yml
    google_api_key = ''
    gdal2tiles = 'gdal2tiles.py -k -t '+self.name+' -g '+google_api_key+' '+RAILS_ROOT+'/public/warps/'+self.name+'.tif'
    puts gdal2tiles
    system(gdal2tiles)
  end
  
  def before_save
    self.styles = 'body: {
	lineWidth: 0,
	menu: {
		"Edit GSS": Cartagen.show_gss_editor,
		"Download Image": Cartagen.redirect_to_image,
		"Download Data": Interface.download_bbox
	}
},
node: {
	fillStyle: "#ddd",
	strokeStyle: "#090",
	lineWidth: 0,
	radius: 1,
	opacity: 0.8
},
way: {
	strokeStyle: "#ccc",
	lineWidth: 3,
	opacity: 0.8,
	menu: {
		"Toggle Transparency": function() {
			if (this._transparency_active) {
				this.opacity = 1
				this._transparency_active = false
			}
			else {
				this.opacity = 0.2
				this._transparency_active = true
			}
		}
	}
},
island: {
	strokeStyle: "#24a",
	lineWidth: 4,
	pattern: "/images/brown-paper.jpg"
},
relation: {
	fillStyle: "#57d",
	strokeStyle: "#24a",
	lineWidth: 4,
	pattern: "/images/pattern-water.gif"
},
administrative: {
	lineWidth: 50,
	strokeStyle: "#D45023",
	fillStyle: "rgba(0,0,0,0)",
},
leisure: {
	fillStyle: "#2a2",
	lineWidth: 3,
	strokeStyle: "#181"
},
area: {
	lineWidth: 8,
	strokeStyle: "#4C6ACB",
	fillStyle: "rgba(0,0,0,0)",
	opacity: 0.4,
	fontColor: "#444",
},
park: {
	fillStyle: "#2a2",
	lineWidth: 3,
	strokeStyle: "#181",
	fontSize: 12,
	text: function() { return this.tags.get("name") },
	fontRotation: "fixed",
	opacity: 1
},
waterway: {
	fillStyle: "#57d",
	strokeStyle: "#24a",
	lineWidth: 4,
	pattern: "/images/pattern-water.gif"
},
water: {
	strokeStyle: "#24a",
	lineWidth: 4,
	pattern: "/images/pattern-water.gif"
},
highway: {
	strokeStyle: "white",
	lineWidth: 6,
	outlineWidth: 3,
	outlineColor: "white",
	fontColor: "#333",
	fontBackground: "white",
	fontScale: "fixed",
	text: function() { return this.tags.get("name") }
},
primary: {
	strokeStyle: "#d44",
	lineWidth: function() {
		if (this.tags.get("width")) return parseInt(this.tags.get("width"))*0.8
		else return 10
	}
},
secondary: {
	strokeStyle: "#d44",
	lineWidth: function() {
		if (this.tags.get("width")) return parseInt(this.tags.get("width"))*0.8
		else return 7
	}
},
footway: {
	strokeStyle: "#842",
	lineWidth: function() {
		if (this.tags.get("width")) return parseInt(this.tags.get("width"))*0.8
		else return 3
	}
},
pedestrian: {
	strokeStyle: "#842",
	fontBackground: "rgba(1,1,1,0)",
	fontColor: "#444",
	lineWidth: function() {
		if (this.tags.get("width")) return parseInt(this.tags.get("width"))*0.8
		else return 3
	}
},
parkchange: {
	glow: "yellow"
},
building: {
	opacity: 1,
	lineWidth: 0.001,
	fillStyle: "#444",
	text: function() { return this.tags.get("name") },
	hover: {
		fillStyle: "#222"
	},
	mouseDown: {
		lineWidth: 18,
		strokeStyle: "red"
	},
	menu: {
		"Search on Google": function() {
			if (this.tags.get("name")) {
				window.open("http://google.com/search?q=" + this.tags.get("name"), "_blank")
			}
			else {
				alert("Sorry! The name of this building is unknown.")
			}
		},
		"Search on Wikipedia": function() {
			if (this.tags.get("name")) {
				window.open("http://en.wikipedia.org/wiki/Special:Search?go=Go&search=" + this.tags.get("name"), "_blank")
			}
			else {
				alert("Sorry! The name of this building is unknown.")
			}
		}
	}
},
landuse: {
	fillStyle: "#ddd"
},
rail: {
	lineWidth: 4,
	strokeStyle: "purple"
},
debug: {
	way: {
		menu: {
			"Inspect": function() {$l(this)}
		}
	}
}'
  end
  
  def after_create
    puts 'saving Map'
    if last = Map.find_by_name(self.name,:order => "version DESC")
      self.version = last.version + 1
    end
  end

end
