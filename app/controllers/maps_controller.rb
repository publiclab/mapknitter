require 'open3'

class MapsController < ApplicationController
  protect_from_forgery except: :export

  before_filter :require_login, only: %i(edit update destroy)
  before_filter :find_map, only: %i(show annotate embed edit update images destroy archive)

  layout 'knitter2'

  def index
    # show only maps with at least 1 image to reduce spammer interest
    @maps = Map.page(params[:page])
               .per_page(20)
               .where(archived: false, password: '')
               .order('updated_at DESC')
               .joins(:warpables)
               .group('maps.id')
    # ensure even maps with no images are shown on front page and don't get lost; some spam risk
    @new_maps = Map.where(archived: false, password: '')
                   .order('updated_at DESC')
    render layout: 'application'
  end

  def map
    @maps = Map.map
    render layout: false
  end

  def new
    @map = Map.new
  end

  def create
    if logged_in?
      @map = current_user.maps.new(map_params)
      @map.author = current_user.login # eventually deprecate
      if @map.save
        redirect_to "/maps/#{@map.slug}"
      else
        render 'new'
      end
    else
      @map = Map.new(map_params)
      if Rails.env != 'production' || verify_recaptcha(model: @map, message: "ReCAPTCHA thinks you're not human! Try again!")
        if @map.save
          redirect_to "/maps/#{@map.slug}"
        else
          render 'new'
        end
      else
        @map.errors.add(:base, I18n.t(:wrong_captcha))
        render 'new'
      end
    end
  end

  def show
    @map.zoom ||= 12

    # this is used for the resolution slider
    @resolution = @map.average_cm_per_pixel.round(4)
    @resolution = 5 if @resolution < 5 # soft-set min res

    # remove following lines once legacy interface is deprecated
    render template: 'map/show', layout: 'knitter' if params[:legacy]
  end

  def archive
    if logged_in? && current_user.can_delete?(@map)
      @map.archived = true
      if @map.save
        flash[:notice] = 'Archived map.'
      else
        flash[:error] = 'Failed to archive map.'
      end
    else
      flash[:error] = 'Only admins may archive maps.'
    end
    redirect_to "/?_=#{Time.now.to_i}"
  end

  def embed
    @map.zoom ||= 12
    @embed = true
    render template: 'maps/show'
  end

  def annotate
    @map.zoom = 12 # get rid of this; use setBounds or something
    @annotations = true # loads annotations-specific assets
  end

  def edit; end

  def update
    @map.update_attributes(map_params)

    save_tags(@map)
    @map.save
    redirect_to action: 'show'
  end

  def destroy
    if current_user.can_delete?(@map)
      @map.destroy
      flash[:notice] = 'Map deleted.'
      redirect_to '/'
    else
      flash[:error] = 'Only admins or map owners may delete maps.'
      redirect_to "/maps/#{@map.slug}"
    end
  end

  # used by leaflet to fetch corner coords of each warpable
  def images
    warpables = []
    @map.warpables.each do |warpable|
      warpables << warpable
      warpables.last[:nodes] = warpable.nodes_array
      warpables.last.src = warpable.image.url
      warpables.last.srcmedium = warpable.image.url(:medium)
    end
    render json: warpables
  end

  # run the export
  def export
    @map = Map.find_by(id: params[:id])
    if logged_in? || Rails.env.development? || verify_recaptcha(model: @map, message: "ReCAPTCHA thinks you're not a human!")
      render plain: @map.run_export(current_user, params[:resolution].to_f)
    else
      render plain: 'You must be logged in to export, unless the map is anonymous.'
    end
  end

  # render list of exports
  def exports
    @map = Map.find_by(id: params[:id])
    render partial: 'maps/exports', layout: false
  end

  # list by region
  def region
    area = params[:id] || 'this area'
    @title = "Maps in #{area}"
    ids = Map.bbox(params[:minlat], params[:minlon], params[:maxlat], params[:maxlon]).collect(&:id)
    @maps = Map.where(password: '')
               .where('id IN (?)', ids)
               .paginate(page: params[:page], per_page: 24)
               .except(:styles)
    @maps.each do |map|
      map.image_urls = map.warpables.map { |warpable| warpable.image.url }
    end
    respond_to do |format|
      format.html { render 'maps/index', layout: 'application' }
      format.json { render json: @maps.to_json(methods: :image_urls) }
    end
  end

  # list by license
  def license
    @title = "Maps licensed '#{params[:id]}'"
    @maps = Map.where(password: '', license: params[:id])
               .order('updated_at DESC')
               .paginate(page: params[:page], per_page: 24)
    render 'maps/index', layout: 'application'
  end

  def featured
    @title = 'Featured maps'
    @maps = Map.featured.paginate(page: params[:page], per_page: 24)
    render 'maps/index', layout: 'application'
  end

  def search
    data = params[:q]
    query = params[:q].gsub(/\s+/, '')

    respond_to do |format|
      if query.length < 3
        flash.now[:notice] = 'Invalid Query: non white-space character count is less than 3'
        @title = 'Featured maps'
        @maps = Map.featured.paginate(page: params[:page], per_page: 24)
        format.html { render 'maps/index', layout: 'application' }
      else
        @title = "Search results for '#{data}'"
        @maps = Map.search(data).paginate(page: params[:page], per_page: 24)
        format.html { render 'maps/index', layout: 'application' }
        format.json { render json: @maps }
      end
    end
  end

  private

  def find_map
    @map = Map.find_by(slug: params[:id])
  end

  def map_params
    params.require(:map).permit(:author, :name, :slug, :lat, :lon, :location, :description, :zoom, :license)
  end
end
