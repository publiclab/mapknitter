require 'open3'

class MapsController < ApplicationController
  protect_from_forgery :except => [:export]

  before_filter :require_user, :only => [:create, :new, :edit, :update, :destroy]

  layout 'knitter2'

  def index
    @maps = Map.page(params[:page]).per_page(24).where(:archived => false,:password => '').order('updated_at DESC')
    render :layout => 'application2'
  end

  def new
    @map = current_user.maps.create(:author => current_user.login)
  end

  def create
    @map = current_user.maps.create(params[:map])
    if @map.save
      redirect_to edit_map_url(@map)
    else
      render "new"
    end
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
