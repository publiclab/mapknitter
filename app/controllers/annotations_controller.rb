class AnnotationsController < ApplicationController
  before_filter :require_user, :except => [ :index, :show ]

  def index
    @map = Map.find params[:map_id]
    render :file => 'annotations/index.json.erb', :content_type => 'application/json'
  end

  def create
    @map = Map.find params[:map_id]
    @annotation = @map.annotations.create params[:annotation]
    @annotation.user_id = current_user.id

    if @annotation.save
      respond_with(@map, @annotation, 201)
    end
  end

  def show
  end

  def update
  end  

  def destroy
  end
end