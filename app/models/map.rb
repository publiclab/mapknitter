class Map < ActiveRecord::Base
  before_validation :update_name
  validates_presence_of :name,:author
  validates_presence_of :location, :message => ' cannot be found. Try entering a latitude and longitude if this problem persists.'
  validates_format_of       :name,
                            :with => /[a-zA-Z0-9_-]/,  
                            :message => " must not include spaces and must be alphanumeric, as it'll be used in the URL of your map, like: http://cartagen.org/maps/your-map-name. You may use dashes and underscores.",
                            :on => :create                  
  has_many :warpables

  def update_name
    self.name = self.name.gsub(/\W/, '-').downcase
  end

  def validate
    self.name != 'untitled'
  end

  # generates a geotiff from an existing tiff, referencing the map warpable coordinates
  def generate_geotiff
    gdalwarp = 'gdalwarp '+RAILS_ROOT+'/public/warps/'+self.name+'.tif'
    gdal_translate = 'gdalwarp '+RAILS_ROOT+'/public/warps/'+self.name+'.tif'
    coordinates = ' '
    self.warpables.each do |warpable|
      warpable.nodes_array.each do |node|
        x = 0
        y = 0
        # this ordering may be wrong:
        coordinates = coordinates+x.to_s+','+y.to_s+' '+node.lat.to_s + ',' + node.lon.to_s + ' '
      end
    end
    puts gdalwarp
    system(gdalwarp)
    puts gdal_translate
    system(gdal_translate)
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
