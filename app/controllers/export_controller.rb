class ExportController < ApplicationController
  protect_from_forgery :except => [:formats]

  # override logger to suppress huge amounts of inane /export/progress logging
  def logger
    if params[:action] == 'progress'
      nil
    else
      RAILS_DEFAULT_LOGGER
    end
  end

  # http://mapknitter.org/warps/yale-farm/yale-farm.jpg
  def jpg
    send_file 'public/warps/'+params[:id]+'/'+params[:id]+'.jpg'
  end

  # http://mapknitter.org/warps/yale-farm/yale-farm-geo.tif
  def geotiff
    send_file 'public/warps/'+params[:id]+'/'+params[:id]+'-geo.tif'
  end

  def cancel
    @map = Map.find params[:id] 
    if @map.anonymous? || logged_in?
      export = @map.export
      export.status = 'none'
      export.save
      render :text => 'cancelled'
    else
      render :text => 'You must be logged in to export, unless the map is anonymous.'
    end
  end

  def progress
    map = Map.find params[:id] 
    if export = map.export
      if  export.status == 'complete'
        output = 'complete'
      elsif export.status == 'none'
        output = 'export not running'
      elsif export.status == 'failed'
        output = 'export failed'
      else
        output = export.status
      end
    else
      output = 'export has not been run'
    end
    render :text => output, :layout => false 
  end

end
