require 'open3'
class Map < ActiveRecord::Base
  before_validation :update_name
  validates_presence_of :name,:author
  validates_presence_of :location, :message => ' cannot be found. Try entering a latitude and longitude if this problem persists.'
  validates_format_of       :name,
                            :with => /[a-zA-Z0-9_-]/,  
                            :message => " must not include spaces and must be alphanumeric, as it'll be used in the URL of your map, like: http://cartagen.org/maps/your-map-name. You may use dashes and underscores.",
                            :on => :create                  
#  has_many :warpables

  # Hash the password before saving the record
  def before_create
    self.password = Password::update(self.password) if self.password != ""
  end

  def update_name
    self.name = self.name.gsub(/\W/, '-').downcase
  end

  def validate
    self.name != 'untitled'
    self.name = self.name.gsub(' ','-')
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
			pxperms << (warpable.width)/dist unless warpable.width.nil? || dist.nil?
			puts 'scale: '+pxperms.last.to_s+' & dist: '+dist.to_s
		end
	end
	puts pxperms
	average = (pxperms.inject {|sum, n| sum + n })/pxperms.length
	puts 'average scale = '+average.to_s
        average
  end

  # distort all warpables, returns upper left corner coords in x,y
  def distort_warpables(scale)
	export = Export.find_by_map_id(self.id)
	puts '> generating geotiffs of each warpable in GDAL'
	lowest_x=0
	lowest_y=0
	warpable_coords = []
	warpables = self.warpables
	current = 0
	warpables.each do |warpable|
		current += 1
		export.status = 'warping '+current.to_s+' of '+warpables.length.to_s
		export.save
		my_warpable_coords = warpable.generate_perspectival_distort(scale,self.name)
		puts '- '+my_warpable_coords.to_s
		warpable_coords << my_warpable_coords
		lowest_x = my_warpable_coords.first if (my_warpable_coords.first < lowest_x || lowest_x == 0)
		lowest_y = my_warpable_coords.last if (my_warpable_coords.last < lowest_y || lowest_y == 0)
	end
	[lowest_x,lowest_y,warpable_coords]
  end

  def generate_composite_tiff(coords,origin)
        directory = RAILS_ROOT+"/public/warps/"+self.name+"/"
        geotiff_location = directory+self.name+'-geo.tif'
	geotiffs = ''
	self.warpables.each do |warpable|
        	geotiffs += ' '+directory+warpable.id.to_s+'-geo.tif'
        end
	gdal_merge = "gdal_merge.py -n 0 -o "+geotiff_location+geotiffs
	#gdal_merge = "gdal_merge.py -v -n 0 -o "+geotiff_location+geotiffs
	#gdal_merge = "gdal_merge.py -v -n 0 -init 255 -o "+geotiff_location+geotiffs
	puts gdal_merge
	system(Gdal.ulimit+gdal_merge)
	geotiff_location
  end
  
# generates a tileset at RAILS_ROOT/public/tms/<map_name>/
  def generate_tiles
    # get google api key from /config/google_api.yml
    google_api_key = 'ABQIAAAANO6Yx8ihhesSqnPHx9a3RxRa3MXy-HPtdEPHe3QoK4dKUOddYRRF_6vITnMAbxADhyUdRZNdR5kvTA'
	# cartagen.org:
	#'ABQIAAAANO6Yx8ihhesSqnPHx9a3RxQ5ix9qLsIfiytjxJIRHII0JHQkKRQXtEgA8345w3Mkz92z_BDeV0SCEA'
    gdal2tiles = 'gdal2tiles.py -k -t "'+self.name+'" -g "'+google_api_key+'" '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'-geo.tif '+RAILS_ROOT+'/public/tms/'+self.name+"/"
#    puts gdal2tiles
#    puts system('which gdal2tiles.py')
    system(Gdal.ulimit+gdal2tiles)
  end
 
  def generate_jpg
	imageMagick = 'convert -background white -flatten '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'-geo.tif '+RAILS_ROOT+'/public/warps/'+self.name+'/'+self.name+'.jpg'
	system(Gdal.ulimit+imageMagick)
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
