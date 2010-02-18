class MapController < ApplicationController
  caches_page :find

  def new
    @map = {:lat => 41.891,
            :lon => 12.4902,
            :name => 'untitled'}
    render :template => 'map/show'
  end
  
  def show
    @map = Map.find_by_name(params[:id],:order => 'version DESC')
  end
  
  def stylesheet
    render :text => Map.find_by_name(params[:id],:order => 'version DESC').styles
  end
  
  # displays a map for the place name in the URL: "cartagen.org/find/cambridge, MA"
  def find
    # determine range, or use default:
    if params[:range]
      range = params[:range].to_f
    end
    range ||= 0.001

    # use lat/lon or geocode a string:
    if params[:lat] && params[:lon]
      geo = GeoKit::GeoLoc.new
      geo.lat = params[:lat]
      geo.lng = params[:lon]
      geo.success = true
    else
      unless params[:id]
        params[:id] = "20 ames st cambridge"
      end
      cache = "geocode"+params[:id]
      geo = Rails.cache.read(cache)
      unless geo
        geo = GeoKit::GeoLoc.geocode(params[:id])
        Rails.cache.write(cache,geo)
      end
    end
    if params[:zoom_level]
      zoom_level = params[:zoom_level]
    else
      zoom_level = Openstreetmap.precision(geo)
    end
    if geo.success
      # use geo.precision to define a width and height for the viewport
      # set zoom_x and zoom_y accordingly in javascript... and the scale factor.
      @map = {:range => range, :zoom_level => zoom_level,:lat => geo.lat, :lng => geo.lng}
    end
  end

  def demo
    find
  end
  
  # def tags
  #   @map = {:zoom_level => Openstreetmap.precision(geo),:lat1 => geo.lat-range, :lng1 => geo.lng-range, :lat2 => geo.lat+range, :lng2 => geo.lng+range }
  # end
  
  # accepts lat1,lng1,lat2,lng2 and returns osm features for the bounding box in various formats
  def plot
    cache = "bbox="+params[:lng1]+","+params[:lat1]+","+params[:lng2]+","+params[:lat2]
    if params[:live] == true
      @features = Rails.cache.read(cache)
    end
    unless @features
      @features = Openstreetmap.features(params[:lng1],params[:lat1],params[:lng2],params[:lat2])
      Rails.cache.write(cache,@features)
    end
    respond_to do |format|
      format.html { render :html => @features }
      format.xml  { render :xml => @features }
      format.kml  { render :template => "map/plot.kml.erb" }
      format.js  { render :json => @features }
    end
  end
  
  # # yields a plot where coastlines are collected in relations
  # # see: http://wiki.openstreetmap.org/wiki/Relations/Proposed/Collected_Ways
  # def plot_relation_adder
  #   
  # end

  # accepts lat1,lng1,lat2,lng2 and returns osm features for the bounding box in various formats
  def tag
    cache = "bbox="+params[:lng1]+","+params[:lat1]+","+params[:lng2]+","+params[:lat2]
    # if params[:live] == true
    #   @features = Rails.cache.read(cache)
    # end
    # unless @features
      @features = Xapi.tag(params[:lng1],params[:lat1],params[:lng2],params[:lat2],params[:key],params[:value])
      # Rails.cache.write(cache,@features)
    # end
    respond_to do |format|
      format.html { render :html => @features }
      format.xml  { render :xml => @features }
      format.kml  { render :template => "map/plot.kml.erb" }
      format.js  { render :json => @features }
    end
  end

end
