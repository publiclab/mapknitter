# Shadow Controller for the new front page
require 'will_paginate/array'

class FrontUiController < ApplicationController
  protect_from_forgery except: :save_location

  def index
    @maps = Map.new_maps.first(4)
    @unpaginated = true
    # TODO: these could use optimization but are better than prev:
    tag = Tag.where(name: 'featured').first # note that this is not a join table but the .maps method still works
    @mappers = User.where(login: tag.maps.collect(&:author)) if tag
    @mappers ||= []
  end

  def all_maps
    @maps = Map.new_maps
  end

  def nearby_mappers
    return unless current_location.present?
    lat = session[:lat]
    lon = session[:lon]
    @nearby_maps = Map.maps_nearby(lat: lat, lon: lon, dist: 10)
                      .page(params[:maps])
                      .per_page(12)
    @nearby_mappers = User.where(login: Map.maps_nearby(lat: lat, lon: lon, dist: 10)
                                           .collect(&:author))
                                           .paginate(page: params[:mappers], per_page: 12)
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

    @authors = User.where(login: Map.featured.collect(&:author))
                                    .paginate(page: params[:mappers], per_page: 20)
  end
end
