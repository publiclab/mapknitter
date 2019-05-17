class FrontUiController < ApplicationController
  def index
    @mappers = Map.nearby_authors(lat: 84.67351257, lon: -172.96875, dist: 50)
    @maps = Map.find(:all)
  end

  def find_maps
    dist = params[:dist].to_i
    lat = params[:lat].to_f
    lon = params[:lon].to_f
    maps = Map.find(:all, :conditions => ['lat > ? AND lat < ? AND lon > ? AND lon < ?',lat-dist,lat+dist,lon-dist,lon+dist], :limit => 20)

    respond_to do |format|
      format.json { render json: maps  }
    end
  end

  def about
  end
end
