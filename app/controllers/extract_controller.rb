class ExtractController < ApplicationController
    caches_page :osm_to_json_by_tag, :osm_to_json

    def osm_to_json
      @features = ParseOsm.parse(params[:url])
      puts @features.length
      respond_to do |format|
        format.html { render :html => @features }
        format.xml  { render :xml => @features }
        format.kml  { render :template => "map/plot.kml.erb" }
        format.js  { render :json => @features }
	format.json { render :json => @features }
      end
    end

    def osm_to_json_by_tag
      params[:url] ||= "http://localhost:3000/rome.osm"
      @features = ParseOsm.filter(params[:url],params[:tag])
      puts @features.length
      respond_to do |format|
        format.html { render :html => @features }
        format.xml  { render :xml => @features }
        format.kml  { render :template => "map/plot.kml.erb" }
        format.js  { render :json => @features }
      end
    end
    
    
    def osm_to_json_collected_ways
      @features = ParseOsm.parse(params[:url])
      puts @features.length
      respond_to do |format|
        format.html { render :html => @features }
        format.xml  { render :xml => @features }
        format.kml  { render :template => "map/plot.kml.erb" }
        format.js  { render :json => @features }
      end
    end

    def georss_to_json
      params[:url] ||= "http://api.flickr.com/services/feeds/geo/?tags=mushroommap&lang=en-us&format=rss_200"
      @features = ParseGeoRss.parse(params[:url])
      respond_to do |format|
        format.html { render :html => @features }
        format.xml  { render :xml => @features }
        #format.kml  { render :template => "map/plot.kml.erb" }
        format.js  { render :json => @features }
      end
    end

		def kml_to_json
			params[:url] ||= 'cartagen.localhost/doc.kml'
      @features = ParseKml.parse(params[:url])
      respond_to do |format|
        format.html { render :html => @features }
        format.xml  { render :xml => @features }
        #format.kml  { render :template => "map/plot.kml.erb" }
        format.js  { render :json => @features }
      end
    end
end
