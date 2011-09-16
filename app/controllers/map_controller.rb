require 'open3'
class MapController < ApplicationController
  caches_page :find
  protect_from_forgery :except => [:formats, :export]

  def index
    # only maps with at least 1 warpable:
    @maps = Map.find :all, :conditions => {:archived => false, :password => ''}, :order => 'updated_at DESC', :joins => :warpables, :group => "maps.id"
    @maps = @maps.paginate :page => params[:page], :per_page => 24
    @featured = Map.find :all, :joins => :warpables, :group => "maps.id", :select => 'maps.*, count(warpables.id) AS warpables_count', :conditions => ["password IS NOT NULL"], :order => 'warpables_count DESC', :limit => 2
    @authors = Map.authors

    respond_to do |format|
      format.html {  }
      format.xml  { render :xml => @maps }
      format.json  { render :json => @maps }
    end
  end

  def edit
    @map = Map.find_by_name params[:id]
    @export = Export.find_by_map_id(@map.id)
    if @map.password != "" && !Password::check(params[:password],@map.password) 
      flash[:error] = "That password is incorrect." if params[:password] != nil
      redirect_to "/map/login/"+params[:id]+"?to=/map/edit/"+params[:id]
    else
      @images = Warpable.find_all_by_map_id(@map.id,:conditions => ['parent_id IS NULL AND deleted = false'])
    end
  end

  def archive
    if APP_CONFIG["password"] == params[:pwd]
      map = Map.find_by_name(params[:id])
      map.archived = true
      map.save
      flash[:notice] = "Archived map."
    else
      flash[:error] = "Failed to archive map."
    end
    redirect_to "/"
  end

  def region
    @maps = Map.bbox(params[:minlat],params[:minlon],params[:maxlat],params[:maxlon])
  end

  # pt fm ac wpw
  def images
    @map = Map.find_by_name params[:id]
    @images = Warpable.find_all_by_map_id(@map.id,:conditions => ['parent_id IS NULL AND deleted = false'])
    @image_locations = []
    if @images
      @images.each do |image|
        if image.nodes != ''
          node = image.nodes.split(',').first
          node_obj = Node.find(node)
          @image_locations << [node_obj.lon,node_obj.lat]
        else
        end
      end
      render :layout => false
    else
      render :text => "<h2>There are no images in this map.</h2>"
    end
  end

  # just a template pointer... maybe uneccessary
  def new
  end

  def add_static_data
    @map = Map.find params[:id]
    static_data = @map.static_data.split(',')
    static_data << params[:url]
    @map.static_data = static_data.join(',')
    @map.save
  end

  def update_map
    @map = Map.find(params[:map][:id])
    if @map.password != "" && !Password::check(params[:password],@map.password) 
      flash[:error] = "That password is incorrect." if params[:password] != nil
      redirect_to "/map/login/"+params[:id]+"?to=/map/edit/"+params[:id]
    else
      @map.update_attributes(params[:map])
      @map.author = params[:map][:author]
      @map.description = params[:map][:description]
  	location = GeoKit::GeoLoc.geocode(params[:map][:location])
      @map.lat = location.lat
      @map.lon = location.lng
      @map.password = Password.update(params[:map][:password]) if @map.password != "" && @map.password != "*****"
      @map.save
      redirect_to '/map/edit/'+@map.name
    end
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
      if verify_recaptcha(:model => @map, :message => "ReCAPTCHA thinks you're not a human!") && @map.save
      #if @map.save
        redirect_to :action => 'show', :id => @map.name
      else
	index
        render :action=>"index", :controller=>"map"
      end
    end
  end
 
  def login
  end

  # http://www.zacharyfox.com/blog/ruby-on-rails/password-hashing 
  def show
    @map = Map.find_by_name(params[:id],:order => 'version DESC')
    if @map.password != "" && !Password::check(params[:password],@map.password) 
      flash[:error] = "That password is incorrect." if params[:password] != nil
      redirect_to "/map/login/"+params[:id]+"?to=/maps/"+params[:id]
    else
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
      elsif (warpable.nodes == "" && warpable.created_at == warpable.updated_at)
	# delete warpables which have not been placed and are older than 1 hour:
	warpable.delete if DateTime.now-1.hour > warpable.created_at
      end
      @nodes[warpable.id.to_s] ||= 'none'
    end
    if !@warpables || @warpables && @warpables.length == 1 && @warpables.first.nodes == "none"
      location = GeoKit::GeoLoc.geocode(@map.location)
      @map.lat = location.lat
      @map.lon = location.lng
	puts @map.lat
	puts @map.lon
      @map.save
    end
    render :layout => false
    end
  end

  def search
    params[:id] ||= params[:q]
    @maps = Map.find(:all, :conditions => ['archived = false AND (name LIKE ? OR location LIKE ? OR description LIKE ?)',"%"+params[:id]+"%", "%"+params[:id]+"%", "%"+params[:id]+"%"],:limit => 100)
  end
 
  def update
    @map = Map.find(params[:id])
    @map.lat = params[:lat]
    @map.lon = params[:lon]
    @map.vectors = true if params[:vectors] == 'true'
    @map.vectors = false if params[:vectors] == 'false'
    @map.tiles = params[:tiles] if params[:tiles]
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
  def formats
	@map = Map.find params[:id] 
	@export = Export.find_by_map_id(params[:id])
	render :layout => false
  end

  def output
	@map = Map.find params[:id] 
	if @export = Export.find_by_map_id(params[:id])
		@running = (@export.status != 'complete' && @export.status != 'none' && @export.status != 'failed')
	else
		@running = false
	end
	render :layout => false
  end

  def layers
	render :layout => false
  end

  def cancel_export
	export = Export.find_by_map_id(params[:id])
	export.status = 'none'
	export.save
	render :text => 'cancelled'
  end

  def progress
	if export = Export.find_by_map_id(params[:id])
		if  export.status == 'complete'
			output = 'complete'
		elsif export.status == 'none'
			output = 'export has not been run'
		elsif export.status == 'failed'
			output = 'export failed'
		else
			output = ' <img class="export_status" src="/images/spinner-small.gif">'+ export.status
		end
	else
		output = 'export has not been run'
	end
	render :text => output, :layout => false 
  end

  def export
	map = Map.find_by_name params[:id]
	begin
		unless export = Export.find_by_map_id(map.id)
			export = Export.new({:map_id => map.id,:status => 'starting'})
		end
		export.status = 'starting'
		export.tms = false
		export.geotiff = false
		export.jpg = false
		export.save       

		directory = RAILS_ROOT+"/public/warps/"+map.name+"/"
		stdin, stdout, stderr = Open3.popen3('rm -r '+directory)
		puts stdout.readlines
		puts stderr.readlines
		stdin, stdout, stderr = Open3.popen3('rm -r '+RAILS_ROOT+'/public/tms/'+map.name)
		puts stdout.readlines
		puts stderr.readlines
	
		puts '> averaging scales'
		pxperm = map.average_scale # pixels per meter
	
		puts '> distorting warpables'
		origin = map.distort_warpables(pxperm)
		warpable_coords = origin.pop	

		export = Export.find_by_map_id(map.id)
		export.status = 'compositing'
		export.save
	
		puts '> generating composite tiff'
		geotiff_location = map.generate_composite_tiff(warpable_coords,origin)
	
		info = (`identify -quiet -format '%b,%w,%h' #{geotiff_location}`).split(',')
		puts info
		#stdin, stdout, stderr = Open3.popen3("identify -quiet -format '%b,%w,%h' #{geotiff_location}")
		#puts stderr.readlines
		#info = stdout.readlines.split(',') 
	
		export = Export.find_by_map_id(map.id)
		if info[0] != ''
			export.geotiff = true
			export.size = info[0]
			export.width = info[1]
			export.height = info[2]
			export.cm_per_pixel = 100.0000/pxperm
			export.status = 'tiling'
			export.save
		end
	
		puts '> generating tiles'
		export = Export.find_by_map_id(map.id)
		export.tms = true if map.generate_tiles
		export.status = 'creating jpg'
		export.save

		puts '> generating jpg'
		export = Export.find_by_map_id(map.id)
		export.jpg = true if map.generate_jpg
		export.status = 'complete'
		export.save
	
	rescue SystemCallError
  	#	$stderr.print "failed: " + $!
		export = Export.find_by_map_id(map.id)
		export.status = 'failed'
		export.save
	end
        render :text => "new Ajax.Updater('formats','/map/formats/#{map.id}')"
  end
end
