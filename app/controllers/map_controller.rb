class MapController < ApplicationController
  caches_page :find

  def index
    @maps = Map.find :all, :order => 'updated_at DESC', :limit => 25
  end

  def edit
    @map = Map.find_by_name params[:id]
    @images = Warpable.find_all_by_map_id(@map.id,:conditions => ['parent_id IS NULL AND deleted = false'])
  end

  def new

  end

  def add_static_data
    @map = Map.find params[:id]
    static_data = @map.static_data.split(',')
    static_data << params[:url]
    @map.static_data = static_data.join(',')
    @map.save
  end

  def cache
    keys = params[:id].split(',')
    keys.each do |key|
      system('cd '+RAILS_ROOT+'/public/api/0.6/geohash && wget '+key+'.json')
    end
  end

  def clear_cache
      system('rm '+RAILS_ROOT+'/public/api/0.6/geohash/*.json')
  end

  def update_map
    @map = Map.find(params[:map][:id])
    @map.update_attributes(params[:map])
    location = GeoKit::GeoLoc.geocode(params[:map][:location])
    @map.lat = location.lat
    @map.lon = location.lng
    @map.save
    flash[:notice] = "Saved map."
    redirect_to '/map/edit/'+@map.name
  end

  def create
    if params[:location] == ''
      @map = Map.new
      @map.errors.add :location, 'You must name a location. You may also enter a latitude and longitude instead.'
      index
      render :action=>"index", :controller=>"map"
    else
      if params[:latitude] == '' && params[:longitude] == ''
	location = ''
	puts 'geocoding'
        begin
          location = GeoKit::GeoLoc.geocode(params[:location])
	  @map = Map.new({:lat => location.lat,
            :lon => location.lng,
            :name => params[:name],
            :location => params[:location]})
        rescue
	  @map = Map.new({
            :name => params[:name]})
	end
      else
	puts 'nogeocoding'
        @map = Map.new({:lat => params[:latitude],
            :lon => params[:longitude],
            :name => params[:name],
            :location => params[:location]})
      end
      if @map.save
        redirect_to :action => 'show', :id => @map.name
      else
	index
        render :action=>"index", :controller=>"map"
      end
    end
  end
  
  def show
    @map = Map.find_by_name(params[:id],:order => 'version DESC')
    @map.zoom = 1.6 if @map.zoom == 0
    @warpables = Warpable.find :all, :conditions => {:map_id => @map.id, :deleted => false} 
    @nodes = {}
    @warpables.each do |warpable|
      if warpable.nodes != ''
        nodes = []
        warpable.nodes.split(',').each do |node|
          node_obj = Node.find(node)
          nodes << [node_obj.lon,node_obj.lat]
        end
        @nodes[warpable.id.to_s] = nodes
      else
      end
      @nodes[warpable.id.to_s] ||= 'none'
    end
    render :layout => false
  end

  def search
    params[:id] ||= params[:q]
    @maps = Map.find(:all, :conditions => ['name LIKE ? OR location LIKE ? OR description LIKE ?',"%"+params[:id]+"%", "%"+params[:id]+"%", "%"+params[:id]+"%"],:limit => 100)
  end
 
  def update
    @map = Map.find(params[:id])
    @map.lat = params[:lat]
    @map.lon = params[:lon]
    @map.zoom = params[:zoom]
    if @map.save
      render :text => 'success'
    else
      render :text => 'failure'
    end
  end

  def geolocate
    begin
	@location = GeoKit::GeoLoc.geocode(params[:q])
	render :layout => false
    rescue
	render :text => "No results"
    end
  end
 
  def stylesheet
    render :text => Map.find_by_name(params[:id],:order => 'version DESC').styles, :layout => false
  end
  
  # displays a map for the place name in the URL: "cartagen.org/find/cambridge, MA"
  def find
    # determine range, or use default:
    if params[:range]
      range = params[:range].to_f
    end
    range ||= 0.001

    # use lat/lon or geocode a string:
    if params[:lat] && params[:lon]
      geo = GeoKit::GeoLoc.new
      geo.lat = params[:lat]
      geo.lng = params[:lon]
      geo.success = true
    else
      unless params[:id]
        params[:id] = "20 ames st cambridge"
      end
      cache = "geocode"+params[:id]
      geo = Rails.cache.read(cache)
      unless geo
        geo = GeoKit::GeoLoc.geocode(params[:id])
        Rails.cache.write(cache,geo)
      end
    end
    if params[:zoom_level]
      zoom_level = params[:zoom_level]
    else
      zoom_level = Openstreetmap.precision(geo)
    end
    if geo.success
      # use geo.precision to define a width and height for the viewport
      # set zoom_x and zoom_y accordingly in javascript... and the scale factor.
      @map = {:range => range, :zoom_level => zoom_level,:lat => geo.lat, :lng => geo.lng}
      render :layout => false
    end
  end
  
  # accepts lat1,lng1,lat2,lng2 and returns osm features for the bounding box in various formats
  def plot
    cache = "bbox="+params[:lng1]+","+params[:lat1]+","+params[:lng2]+","+params[:lat2]
    if params[:live] == true
      @features = Rails.cache.read(cache)
    end
    unless @features
      @features = Openstreetmap.features(params[:lng1],params[:lat1],params[:lng2],params[:lat2])
      Rails.cache.write(cache,@features)
    end
    respond_to do |format|
      format.html { render :html => @features, :layout => false }
      format.xml  { render :xml => @features, :layout => false }
      format.kml  { render :template => "map/plot.kml.erb", :layout => false }
      format.js  { render :json => @features, :layout => false }
    end
  end

  # accepts lat1,lng1,lat2,lng2 and returns osm features for the bounding box in various formats
  def tag
    cache = "bbox="+params[:lng1]+","+params[:lat1]+","+params[:lng2]+","+params[:lat2]
    # if params[:live] == true
    #   @features = Rails.cache.read(cache)
    # end
    # unless @features
      @features = Xapi.tag(params[:lng1],params[:lat1],params[:lng2],params[:lat2],params[:key],params[:value])
      # Rails.cache.write(cache,@features)
    # end
    respond_to do |format|
      format.html { render :html => @features, :layout => false }
      format.xml  { render :xml => @features, :layout => false }
      format.kml  { render :template => "map/plot.kml.erb", :layout => false }
      format.js  { render :json => @features, :layout => false }
    end
  end

  def export
    respond_to do |format|
      format.html { 
	map = Map.find_by_name params[:id]
	scale = 1
	# determine optimal zoom level
	widths = []
	reasonable_warpables = []
	map.warpables.each do |warpable|
		unless warpable.width.nil?
			nodes = warpable.nodes_array
			scale = 20037508.34
    			y1 = Cartagen.spherical_mercator_lat_to_y(nodes[0].lat,scale)
    			x1 = Cartagen.spherical_mercator_lon_to_x(nodes[0].lon,scale)
    			y2 = Cartagen.spherical_mercator_lat_to_y(nodes[1].lat,scale)
    			x2 = Cartagen.spherical_mercator_lon_to_x(nodes[1].lon,scale)
			dist = Math.sqrt(((y2-y1)*(y2-y1))+((x2-x1)*(x2-x1)))
			widths << (warpable.width*scale)/dist
			puts 'scale: '+scale.to_s+' & dist: '+dist.to_s
		end
	end

	average = (widths.inject {|sum, n| sum + n })/widths.length
	puts average.to_s+' = average'

	# distort all warpables
	lowest_x=0
	lowest_y=0
	warpable_coords = []
	map.warpables.each do |warpable|
		my_warpable_coords = warpable.generate_affine_distort(average,map.name)
		warpable_coords << my_warpable_coords
		lowest_x = my_warpable_coords.first if (my_warpable_coords.first < lowest_x || lowest_x == 0)
		lowest_y = my_warpable_coords.last if (my_warpable_coords.last < lowest_y || lowest_y == 0)
	end
	tif_string = 'convert '
	warp_string = "["
	first = true
	for i in 0..map.warpables.length-1 do
		warp_string += "," unless first
		first = false if first
		x = (warpable_coords[i][0]-lowest_x).to_i.to_s
		y = (warpable_coords[i][1]-lowest_y).to_i.to_s
		tif_string += " -page +"+x+"+"+y+" "+RAILS_ROOT+"/public/warps/"+map.name+"/"+map.warpables[i].id.to_s+".tif"
		warp_string += "['"+map.warpables[i].id.to_s+".tif',"+x+","+y+"]"
	end
	tif_string += " "+RAILS_ROOT+"/public/warps/"+map.name+".tif"
	warp_string += "]"

	# generate photoshop script
	path = RAILS_ROOT+"/public/warps/"+map.name+"/"	
	text = File.read(RAILS_ROOT+'/lib/cartagen-photoshop-export.jsx')
	text.gsub!('<document-title>',map.name)
	text.gsub!('<document-width>',5000.to_s)
	text.gsub!('<document-height>',5000.to_s)
	text.gsub!('<cm-per-pixel>',average.to_s)

	text.gsub!('<warps>',warp_string) # [['filename',x,y],['filename',x,y]]

	# write photoshop script file
	File.open(path+'cartagen-photoshop-export.jsx', 'w') {|f| f.write(text) }

	# zip it up
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
	# warn that it might take a while

	puts 'generating tiff: '+tif_string
	system(tif_string)

	puts 'generating geotiff'
	map.generate_geotiff
	puts 'generating tiles'
	map.generate_tiles

	render :text => '<a href="/warps/'+map.name+'.tif">'+map.name+'.tif</a><br /><a href="/warps/'+map.name+'.zip">'+map.name+'.zip</a>'
      }
    end
  end

end
