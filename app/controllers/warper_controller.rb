class WarperController < ApplicationController

  def new
    @warpable = Warpable.new
  end

  def create
    @warpable = Warpable.new(params[:warpable])
    puts params[:warpable]
    if @warpable.save
      flash[:notice] = 'Warpable was successfully created.'
      redirect_to :action => 'uploaded_confirmation',:id => @warpable.id
    else
      flash[:notice] = 'There was an error'
      render :action => :new
    end
  end
  
  def create_asynchronous
    @warpable = Warpable.new(params[:warpable])
    puts params[:warpable]
    if @warpable.save
      flash[:notice] = 'Warpable was successfully created.'
      redirect_to :action => 'uploaded_confirmation',:id => @warpable.id
    else
      flash[:notice] = 'There was an error'
      render :action => :new
    end
  end

  def uploaded_confirmation
    @warpable = Warpable.find params[:id]
  end
  
  def show
    @image = Warpable.find params[:id]
  end
  
  def list
    @warpables = Warpable.find :all, :conditions => ['parent_id is NULL']
  end
  
end
