require 'open3'

class MapsController < ApplicationController
  protect_from_forgery :except => [:export]
  before_filter :require_login, :only => [:edit, :update, :destroy]

  layout 'knitter2'

  def index
    # show only maps with at least 1 image to reduce spammer interest
    @maps = Map.page(params[:page])
               .per_page(20)
	       .where(archived: false, password: '')
	       .order('updated_at DESC')
               .joins(:warpables)
	       .group("maps.id")
    # ensure even maps with no images are shown on front page and don't get lost; some spam risk
    @new_maps = Map.where(archived: false, password: '')
	       .order('updated_at DESC')
    render :layout => 'application'
  end

  def map
    @maps = Map.where(archived: false, password: '')
               .select('author, maps.name, lat, lon, slug, archived, password, users.login as user_login')
               .joins(:warpables, :user)
               .group("maps.id")
    render layout: false
  end

  def new
    @map = Map.new
  end

  def create
    if logged_in?
      @map = current_user.maps.new(params[:map])
      @map.author = current_user.login # eventually deprecate
      if @map.save
        redirect_to "/maps/#{@map.slug}"
      else
        render "new"
      end
    else
      @map = Map.new(params[:map])
      if Rails.env != 'production' || verify_recaptcha(:model => @map, :message => "ReCAPTCHA thinks you're not human! Try again!")
        if @map.save
          redirect_to "/maps/#{@map.slug}"
        else
          render "new"
        end
      else
        @map.errors.add(:base, I18n.t(:wrong_captcha))
        render "new"
      end
    end
  end

  def show
    @map = Map.find params[:id]
    @map.zoom ||= 12

    # stuff for Sparklines resolution graph; 
    # messy, could tuck into model
    #hist = @map.images_histogram 
    #(0..100).each do |i|
    # hist[i] = 0 if !hist[i]
    #end
    #hist = hist[0..100]
    #@images_histogram = @map.grouped_images_histogram((hist.length/15).to_i+1)

    # this is used for the resolution slider
    @resolution = @map.average_cm_per_pixel.round(4)
    @resolution = 5 if @resolution < 5 # soft-set min res

    # remove following lines once legacy interface is deprecated
    if params[:legacy]
      render :template => 'map/show', :layout => 'knitter'
    end
  end

  def archive
    @map = Map.find_by_slug(params[:id])
    if logged_in? && current_user.can_delete?(@map)
      @map.archived = true
      if @map.save
        flash[:notice] = "Archived map."
      else
        flash[:error] = "Failed to archive map."
      end
    else
      flash[:error] = "Only admins may archive maps."
    end
    redirect_to '/?_=' + Time.now.to_i.to_s
  end

  def embed
    @map = Map.find params[:id]
    @map.zoom ||= 12
    @embed = true
    render :template => 'maps/show'
  end

  def annotate
    @map = Map.find params[:id]
    @map.zoom = 12 # get rid of this; use setBounds or something
    @annotations = true # loads annotations-specific assets
  end

  def edit
    @map = Map.find params[:id]
  end

  def update
    @map = Map.find    params[:id]
    @map.name =        params[:map][:name]
    @map.location =    params[:map][:location]
    @map.lat =         params[:map][:lat]
    @map.lon =         params[:map][:lon]
    @map.description = params[:map][:description]
    @map.license =     params[:map][:license] if @map.user_id == current_user.id

    # save new tags
    if params[:tags]
      params[:tags].gsub(' ', ',').split(',').each do |tagname|
        @map.add_tag(tagname.strip, current_user)
      end
    end

    @map.save
    redirect_to :action => "show"
  end

  def destroy
    @map = Map.find params[:id]
    if current_user.can_delete?(@map)
      @map.destroy
      flash[:notice] = "Map deleted."
      redirect_to "/"
    else
      flash[:error] = "Only admins or map owners may delete maps."
      redirect_to "/maps/#{@map.slug}"
    end
  end

  # used by leaflet to fetch corner coords of each warpable
  def images
    map = Map.find params[:id]
    warpables = []
    map.warpables.each do |warpable|
      warpables << warpable
      warpables.last[:nodes] = warpable.nodes_array
      warpables.last.src = warpable.image.url
      warpables.last.srcmedium = warpable.image.url(:medium)
    end
    render :json => warpables
  end

  # run the export
  def export
    map = Map.find params[:id]
    if logged_in? || Rails.env.development? || verify_recaptcha(:model => map, :message => "ReCAPTCHA thinks you're not a human!")
      render :text => map.run_export(current_user,params[:resolution].to_f)
    else
      render :text => 'You must be logged in to export, unless the map is anonymous.'
    end
  end

  # render list of exports
  def exports
    @map = Map.find params[:id]
    render :partial => "maps/exports", :layout => false
  end

  # list by region
  def region
    area = params[:id] || "this area"
    @title = "Maps in #{area}"
    ids = Map.bbox(params[:minlat],params[:minlon],params[:maxlat],params[:maxlon]).collect(&:id)
    @maps = Map.where(password: '').where('id IN (?)',ids).paginate(:page => params[:page], :per_page => 24).except(:styles)
    @maps.each do |map|
      map.image_urls = map.warpables.map{ |warpable| warpable.image.url}
    end
    respond_to do |format|
      format.html { render "maps/index", :layout => "application" } 
      format.json { render :json => @maps.to_json(methods: :image_urls) }
    end
  end

  # list by license
  def license
    @title = "Maps licensed '#{params[:id]}'"
    @maps = Map.where(password: '',license: params[:id]).order('updated_at DESC').paginate(:page => params[:page], :per_page => 24)
    render "maps/index", :layout => "application"
  end

  def featured
    @title = "Featured maps"
    @maps = Map.joins(:warpables).select("maps.*, count(maps.id) as image_count").group("warpables.map_id").order("image_count DESC").paginate(:page => params[:page], :per_page => 24)
    render "maps/index", :layout => "application"
  end

  def search
    params[:id] ||= params[:q]
    @maps = Map.select("archived, author created_at, description, id, lat, license, location, name, slug, tile_layer, tile_url, tiles, updated_at, user_id, version, zoom").where('archived = ? AND (name LIKE ? OR location LIKE ? OR description LIKE ?)', false, "%"+params[:id]+"%", "%"+params[:id]+"%", "%"+params[:id]+"%").paginate(:page => params[:page], :per_page => 24)
    @title = "Search results for '#{params[:id]}'"
    respond_to do |format|
     format.html { render "maps/index", :layout => "application" } 
     format.json { render :json => @maps }
    end
  end

end
