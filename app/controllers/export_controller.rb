class ExportController < ApplicationController
  protect_from_forgery :except => [:formats]

  def index
    @exports = Export.where('status NOT IN (?)',['failed','complete','none'])
      .order('updated_at DESC')
    @day = Export.where(status:'complete')
      .where('updated_at > (?)',(Time.now-1.day).to_s(:db))
      .count
    @week = Export.where(status:'complete')
      .where('updated_at > (?)',(Time.now-1.week).to_s(:db))
      .count
  end

  # export of arbitrary image collections
  def export
    if params[:key]
      key = params[:key]
    else
      key = APP_CONFIG ? APP_CONFIG["google_maps_api_key"] : "AIzaSyAOLUQngEmJv0_zcG1xkGq-CXIPpLQY8iQ"
    end
    unless export
      export = Export.new({
        :map_id => 0 # not tied to a map
      })
    end
    Exporter.run_export(user, 
      params[:resolution],
      export,
      0,
      params[:slug],
      Rails.root.to_s,
      params[:resolution],
      Warpable.find(params[:image_ids],
      key)
  end

  # override logger to suppress huge amounts of inane /export/progress logging
  def logger
    if params[:action] == 'progress'
      nil
    else
      RAILS_DEFAULT_LOGGER
    end
  end

  # https://mapknitter.org/warps/yale-farm/yale-farm.jpg
  def jpg
    send_file 'public/warps/'+params[:id]+'/'+params[:id]+'.jpg'
  end

  # https://mapknitter.org/warps/yale-farm/yale-farm-geo.tif
  def geotiff
    send_file 'public/warps/'+params[:id]+'/'+params[:id]+'-geo.tif'
  end

  def cancel
    @map = Map.find params[:id] 
    if @map.anonymous? || logged_in?
      export = @map.export
      export.status = 'none'
      export.save
      if params[:exports]
        flash[:notice] = "Export cancelled."
        redirect_to "/exports"
      else
        render :text => 'cancelled'
      end
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
