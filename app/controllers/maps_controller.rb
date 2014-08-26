require 'open3'
require 'will_paginate'

class MapsController < ApplicationController
  protect_from_forgery :except => [:export]

  before_filter :require_user, :only => [:create, :new, :edit, :update, :destroy]

  def index
    @maps = Map.find :all, :order => 'updated_at DESC', :joins => :warpables, :limit => 24, :group => "maps.id" 
    @unpaginated = true
    @maps = @maps.paginate :page => params[:page], :per_page => 24

    render :layout => 'application2'
  end

  def new
  end

  def create
  end

  def show
    @map = Map.find params[:id]

    @map.zoom = 12

    render :layout => 'knitter2'
  end

  def edit
    @map = Map.find params[:id]

    @map.zoom = 12

    render :layout => 'knitter2'
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
