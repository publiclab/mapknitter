# Shadow Controller for the new front page
require 'will_paginate/array'

class FrontUiController < ApplicationController
  protect_from_forgery except: :save_location

  def index
    @mappers = Map.featured_authors.sample(4)
    @maps = Map.new_maps.first(4)
    @unpaginated = true
  end

  def all_maps
    @maps = Map.new_maps
  end

  def nearby_mappers
    @nearby_maps = []

    if current_location.present?
      lat = session[:lat]
      lon = session[:lon]
      @nearby_maps = Map.maps_nearby(lat: lat, lon: lon, dist: 10)
                        .page(params[:maps])
                        .per_page(12)
    end

    @all_mappers = Map.featured_authors.paginate(page: params[:mappers], per_page: 12)
  end

  def save_location
    lat = params[:lat].to_f
    lon = params[:lon].to_f

    session[:lat] = lat
    session[:lon] = lon
    render nothing: true
  end

  def about; end

  def gallery
    @maps = Map.page(params[:maps])
               .per_page(20)
               .where(archived: false, password: '')
               .order('updated_at DESC')
               .group('maps.id')
    @authors = Map.featured_authors.paginate(page: params[:mappers], per_page: 20)
  end
end
