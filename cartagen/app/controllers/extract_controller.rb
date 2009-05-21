class ExtractController < ApplicationController
    caches_page :osm_to_json_by_tag, :osm_to_json

    def osm_to_json
      params[:url] ||= "http://localhost:3000/rome.osm"
      @features = ParseOsm.parse(params[:url])
      puts @features.length
      respond_to do |format|
        format.html { render :html => @features }
        format.xml  { render :xml => @features }
        format.kml  { render :template => "map/plot.kml.erb" }
        format.js  { render :json => @features }
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

end
