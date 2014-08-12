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

    if params[:comment]
      @map.comments.create({
        :user_id => current_user.id,
        :map_id => @map.id,
        :body => params[:comment]
      });
    end

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
