class FrontUiController < ApplicationController
  def index
    @mappers = Map.featured_authors
    @maps = Map.new_maps.first(4)
  end

  def all_maps
    @maps = Map.new_maps
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
