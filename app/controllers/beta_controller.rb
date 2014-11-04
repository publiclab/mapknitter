require 'open3'
class BetaController < ApplicationController
  protect_from_forgery :except => [:export]

  def index
    # only maps with at least 1 warpable:
    @maps = Map.find :all, :conditions => {:archived => false, :password => ''}, :order => 'updated_at DESC', :joins => :warpables, :group => "maps.id", :limit => 24
    @notes = Node.find :all, :order => "id DESC", :limit => 5
    @unpaginated = true
    @authors = Map.find(:all, :limit => 12, :group => "maps.author", :order => "id DESC", :conditions => ['password = "" AND archived = "false"']).collect(&:author)

    respond_to do |format|
      format.html {  }
      format.xml  { render :xml => @maps }
      format.json  { render :json => @maps }
    end
  end

  def all
    @maps = Map.find :all, :conditions => {:password => ''}, :order => 'updated_at DESC'
    @maps = @maps.paginate :page => params[:page], :per_page => 24
    render "map/index"
  end

  def license
    @maps = Map.find :all, :conditions => {:password => '',:license => params[:id]}, :order => 'updated_at DESC'
    @maps = @maps.paginate :page => params[:page], :per_page => 24
    render "map/search"
  end

  def view
    @map = Map.find_by_name params[:id]
    @export = @map.latest_export
    if @map.password == "" || Password::check(params[:password],@map.password) || params[:password] == APP_CONFIG["password"] 
      @images = @map.flush_unplaced_warpables
    else
      flash[:error] = "That password is incorrect." if params[:password] != nil
      redirect_to "/map/login/"+params[:id]+"?to=/map/view/"+params[:id]
    end
  end

  def archive
    if APP_CONFIG["password"] == params[:password]
      @map = Map.find_by_name(params[:id])
      @map.archived = true
      if @map.save
        flash[:notice] = "Archived map."
      else
        flash[:error] = "Failed to archive map."
      end
    else
      flash[:error] = "Failed to archive map. Wrong password."
    end
    redirect_to "/"
  end

  def toggle_anon_annotations
    @map = Map.find params[:id]
    if logged_in? && current_user.login == @map.author
      @map.anon_annotatable = !@map.anon_annotatable
      @map.save
      flash[:notice] = "Anonymous annotations allowed." if @map.anon_annotatable
      flash[:notice] = "Anonymous annotations disallowed." if !@map.anon_annotatable
    else
      flash[:error] = "Failed to archive map. Wrong password."
    end
    redirect_to '/map/view/'+@map.name
  end

  def delete
    if logged_in? && current_user.role == "admin"
      @map = Map.find params[:id]
      @map.delete
      flash[:notice] = "Map deleted."
    else
      flash[:error] = "Only admins may delete maps."
    end
    redirect_to "/"
  end

  def region
    @maps = Map.bbox(params[:minlat],params[:minlon],params[:maxlat],params[:maxlon])
    @maps = @maps.paginate :page => params[:page], :per_page => 24
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
    if params[:latitude] == '' && params[:longitude] == ''
      puts 'geocoding'
      begin
        if @map.password == "" || Password::check(params[:password],@map.password) || params[:password] == APP_CONFIG["password"]
        @map.description = params[:map][:description]
        @map.location = params[:map][:location]
          location = GeoKit::GoogleV3Geocoder.geocode(params[:map][:location])
          @map.password = params[:map][:password] if params[:password] == APP_CONFIG["password"]
          @map.lat = location.lat
          @map.lon = location.lng
          if location
            if Rails.env.development? || (verify_recaptcha(:model => @map, :message => "ReCAPTCHA thinks you're not a human!") || logged_in?)
              if @map.save
                flash[:notice] = "Map saved"
              else
                flash[:error] = "Failed to save"
              end
            else
              flash[:error] = "ReCAPTCHA thinks you're not a human! Try one more time."
            end
          else
            flash[:error] = "Location not recognized"
          end
          redirect_to '/map/view/'+@map.name
        else
          flash[:error] = "That password is incorrect." if params[:password] != nil
          redirect_to "/map/login/"+params[:id]+"?to=/map/view/"+params[:id]
        end
      rescue
        flash[:error] = "Geocoding failed. Please enter a more specific address."
        redirect_to "/map/view/"+params[:id]
      end
    else
      puts 'nogeocoding'
      @map.lat = params[:latitude]
      @map.lon = params[:longitude]
      @map.description = params[:map][:description]
      @map.location = params[:map][:location]
      if @map.save
        flash[:notice] = "Map updated."
      else
        flash[:error] = "The map could not be updated. Try a more specific location or contact web@publiclab.org if you continue to have trouble."
      end
      redirect_to '/map/view/'+@map.name
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
            :description => params[:description],
            :author => params[:author],
            :email => params[:email],
            :license => params[:license],
            :tiles => params[:tiles],
            :location => params[:location]})
        rescue
    @map = Map.new({
            :name => params[:name],
            :description => params[:description],
            :author => params[:author],
            :license => params[:license],
            :tiles => params[:tiles],
            :email => params[:email]})
  end
      else
  puts 'nogeocoding'
        @map = Map.new({:lat => params[:latitude],
            :lon => params[:longitude],
            :name => params[:name],
            :description => params[:description],
            :email => params[:email],
            :license => params[:license],
            :tiles => params[:tiles],
            :location => params[:location]})
      end
      @map.user_id = current_user.id if logged_in?
      @map.author = current_user.login if logged_in?
      @map.email = current_user.email if logged_in?
      if Rails.env.development? && @map.save || (verify_recaptcha(:model => @map, :message => "ReCAPTCHA thinks you're not a human!") || logged_in?) && @map.save
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
    if @map.password != "" && !Password::check(params[:password],@map.password) && params[:password] != APP_CONFIG["password"]
      flash[:error] = "That password is incorrect." if params[:password] != nil
      redirect_to "/map/login/"+params[:id]+"?to=/maps/"+params[:id]
    else
    @map.zoom = 1.6 if @map.zoom == 0
    @warpables = @map.flush_unplaced_warpables
    @nodes = @map.nodes
    if !@warpables || @warpables && @warpables.length == 1 && @warpables.first.nodes == "none"
      location = GeoKit::GeoLoc.geocode(@map.location)
      @map.lat = location.lat
      @map.lon = location.lng
  puts @map.lat
  puts @map.lon
      @map.save
    end
    render :layout => 'knitter'
    end
  end

  def search
    params[:id] ||= params[:q]
    @maps = Map.find(:all, :conditions => ['archived = false AND (name LIKE ? OR location LIKE ? OR description LIKE ?)',"%"+params[:id]+"%", "%"+params[:id]+"%", "%"+params[:id]+"%"],:limit => 100)
    @maps = @maps.paginate :page => params[:page], :per_page => 24
  end
 
  # regularly-called "autosave" of warpable image nodes. Maybe rename "autosave"?
  def update
    @map = Map.find(params[:id])
    @map.lat = params[:lat]
    @map.lon = params[:lon]
    @map.vectors = true if params[:vectors] == 'true'
    @map.vectors = false if params[:vectors] == 'false'
    if params[:tiles] && params[:tiles] != 'false'
      @map.tiles = params[:tiles]
      if params[:tiles] == "TMS" || params[:tiles] == "WMS" 
        @map.tile_url = params[:tile_url] 
      else # clear layer information 
        @map.tile_url = ""
        @map.tile_layer = ""
      end
      @map.tile_layer = params[:tile_layer] if params[:tiles] == "WMS" 
    end
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
  
  def output
  @map = Map.find params[:id] 
  if @export = @map.latest_export
    @running = (@export.status != 'complete' && @export.status != 'none' && @export.status != 'failed')
  else
    @running = false
  end
  if @nrg_export = @map.get_export('nrg')
    @nrg_running = (@nrg_export.status != 'complete' && @nrg_export.status != 'none' && @nrg_export.status != 'failed')
  else
    @nrg_running = false
  end
  render :layout => false
  end

  def layers
  @map = Map.find params[:id]
  render :layout => false
  end

  # start with NRG
  def composite
  # write this in map model, really
  @map = Map.find_by_name params[:id]
  if Rails.env.development? || (verify_recaptcha(:model => @map, :message => "ReCAPTCHA thinks you're not a human!") || logged_in?)
    # BRINGS SYSTEM TO A HALT! inspect ulimit params
    #@map.composite(params[:type],params[:infrared])
  end
        render :text => "new Ajax.Updater('nrg_formats','/export/formats/#{@map.id}'?type=nrg)"
  end

  def export
  export_type = "normal"
  map = Map.find_by_name params[:id]
  if Rails.env.development? || (verify_recaptcha(:model => map, :message => "ReCAPTCHA thinks you're not a human!") || logged_in?)
  begin
    unless export = map.get_export(export_type) # searches only "normal" exports
      export = Export.new({:map_id => map.id,:status => 'starting'})
      export.user_id = current_user.id if logged_in?
    end
    export.status = 'starting'
    export.tms = false
    export.geotiff = false
    export.zip = false
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
    pxperm = 100/(params[:resolution]).to_f || map.average_scale # pixels per meter
  
    puts '> distorting warpables'
    origin = map.distort_warpables(pxperm)
    warpable_coords = origin.pop  

    export = map.get_export(export_type)
    export.status = 'compositing'
    export.save
  
    puts '> generating composite tiff'
    geotiff_location = map.generate_composite_tiff(warpable_coords,origin)
  
    info = (`identify -quiet -format '%b,%w,%h' #{geotiff_location}`).split(',')
    puts info
  
    export = map.get_export(export_type)
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
    export = map.get_export(export_type)
    export.tms = true if map.generate_tiles
    export.status = 'zipping tiles'
    export.save

    puts '> zipping tiles'
    export = map.get_export(export_type)
    export.zip = true if map.zip_tiles
    export.status = 'creating jpg'
    export.save

    puts '> generating jpg'
    export = map.get_export(export_type)
    export.jpg = true if map.generate_jpg("normal")
    export.status = 'complete'
    export.save
  
  rescue SystemCallError
    # $stderr.print "failed: " + $!
    export = map.get_export(export_type)
    export.status = 'failed'
    export.save
  end
        render :text => "new Ajax.Updater('formats','/export/formats/#{map.id}')"
    else
        render :text => "$('export_progress').replace('Export failed; RECAPTCHA thinks you are not a human!');"
    end
  end

  def emails
    if params[:password] == APP_CONFIG["password"]
      @maps = Map.find :all
      emails = []
      @maps.each do |m|
        emails << m.name+","+m.author+","+m.email if m.email != ""
      end
      render :text => emails.uniq.join("#")
    end
  end 

  def exports
    render :text => ActiveSupport::JSON.encode(Export.exporting) if params[:password] == APP_CONFIG["password"]
  end

  def assign
    if logged_in? && current_user.role == "admin"
      if params[:claim] == "true"
        # assign each spectrum the current user's id
        @user = User.find_by_login(params[:id])
        @maps = Map.find_all_by_author(params[:author])
        @maps.each do |map|
          map.user_id = @user.id
          map.author = @user.login
          map.save!
        end
        flash[:notice] = "Assigned "+@maps.length.to_s+" maps to "+@user.login
        redirect_to "/"
      else
        @maps = Map.find_all_by_author(params[:author])
      end
    else
      flash[:error] = "You must be logged in and an admin to assign maps."
      redirect_to "/login"
    end
  end

end
