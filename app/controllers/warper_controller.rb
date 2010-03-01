class WarperController < ApplicationController

  def new
    @warpable = Warpable.new
  end

  def create
    @warpable = Warpable.new(params[:warpable])
    if @warpable.save
      flash[:notice] = 'Warpable was successfully created.'
      # redirect_to mugshot_url(@warpable)     
    else
      render :action => :new
    end
  end
  
end
