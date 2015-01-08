require 'open3'

class MapsController < ApplicationController
  protect_from_forgery :except => [:export]

  before_filter :require_login, :only => [:create, :new, :edit, :update, :destroy]

  layout 'knitter2'

  def index
    @maps = Map.page(params[:page]).per_page(24).where(:archived => false,:password => '').order('updated_at DESC')
    render :layout => 'application2'
  end

  def new
    @map = current_user.maps.create(:author => current_user.login)
  end

  def create # should try to catch lat=0 lon=0 maps and error
    @map = current_user.maps.create(params[:map])
    if @map.save
      redirect_to "/map/#{@map.id}"
    else
      render "new"
    end
  end

  def view # legacy route
    @map = Map.find_by_name params[:id]
    redirect_to "/map/#{@map.id}", :status => :moved_permanently
  end

  def show
    @map = Map.find params[:id]
    @map.zoom = 12
  end

  def edit
    @map = Map.find params[:id]
    @map.zoom = 12
  end

  def update
    @map = Map.find params[:id]

    # save lat, lon, location, description 
    @map.description = params[:map][:description]
    @map.location = params[:map][:location]
    @map.lat = params[:map][:lat]
    @map.lon = params[:map][:lon]

    # save new tags
    if params[:tags]
      params[:tags].gsub(' ', ',').split(',').each do |tagname|
        @map.add_tag(tagname.strip, current_user)
      end
    end

    @map.save

    redirect_to :action => "edit"
  end

  def destroy
  end
end
