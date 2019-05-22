class FrontUiController < ApplicationController
  protect_from_forgery :except => [:save_location]

  def index
    @mappers = Map.featured_authors
    @maps = Map.new_maps.first(4)
  end

  def all_maps
    @maps = Map.new_maps
  end

  def nearby_mappers
    lat = session[:lat].to_f
    lon = session[:lon].to_f
    @nearby_maps = Map.maps_nearby(lat: lat, lon: lon, dist: 10)
    @all_mappers = Map.featured_authors
  end

  def save_location
    lat = params[:lat].to_f
    lon = params[:lon].to_f

    session[:lat] = lat
    session[:lon] = lon
    render nothing: true
  end

  def about
  end
end
