class WarperController < ApplicationController

  def new
    @warpable = Warpable.new
  end

  def create
    @warpable = Warpable.new(params[:warpable])
    puts params[:warpable]
    if @warpable.save
      flash[:notice] = 'Warpable was successfully created.'
      redirect_to :action => :show, :id => @warpable.id
    else
      flash[:notice] = 'There was an error'
      render :action => :new
    end
  end
  
  def show
    @image = Warpable.find params[:id]
  end
  
  def list
    @warpables = Warpable.find :all, :conditions => ['parent_id is NULL']
  end
  
end
