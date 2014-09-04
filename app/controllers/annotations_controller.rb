require 'json'

class AnnotationsController < ApplicationController
  # before_filter :require_user, :except => [ :index, :show ]
  before_filter :find_map

  def index
    render :file => 'annotations/index.json.erb', :content_type => 'application/json'
  end

  def create
    params[:annotation][:coordinates] = params[:annotation][:coordinates].to_json.to_s
    respond_to do |format|
      format.json { 
        @annotation = @map.annotations.create params[:annotation]
        @annotation.user_id = current_user.id
        redirect_to map_annotation_url(@map, @annotation)
      }
    end
  end

  def show
    @annotation = Annotation.find params[:id]
    render :file => 'annotations/show.json.erb', :content_type => 'application/json'
  end

  def update
  end  

  def destroy
    @annotation = Annotation.find params[:id]
    # if current_user.can_delete?(@annotation)
      @annotation.delete 
    # end
  end

  def find_map
    @map = Map.find params[:map_id]
  end

end