require 'open3'
class MapsController < ApplicationController
  protect_from_forgery :except => [:export]

  before_filter :require_user, :only => [:create, :new, :edit, :update, :destroy]

  def index
  end

  def new
  end

  def create
  end

  def show
  end

  def edit
    @map = Map.find_by_name params[:id]

    @map.zoom = 12

    render :layout => 'knitter2'
  end

  def update
    @map = Map.find_by_name params[:id]    
    @map.description = params[:map][:description]
    @map.comments = params[:map][:comments]
    if params[:map][:tags]
      params[:map][:tags].gsub(' ', ',').split(',').each do |tagname|
        @map.add_tag(tagname.strip, current_user)
      end
    end

    @map.save

    redirect_to :action => "edit"
  end

  def destroy
  end
end
