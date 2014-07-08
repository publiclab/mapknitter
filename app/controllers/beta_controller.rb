require 'open3'
class BetaController < ApplicationController
  protect_from_forgery :except => [:export]

  def index
    # only maps with at least 1 warpable:
    @maps = Map.find :all, :conditions => {:archived => false, :password => ''}, :order => 'updated_at DESC', :joins => :warpables, :group => "maps.id", :limit => 24
    @notes = Node.find :all, :order => "id DESC", :limit => 5
    @unpaginated = true
    @authors = Map.find(:all, :limit => 12, :group => "maps.author", :order => "id DESC", :conditions => ['password = "" AND archived = "false"']).collect(&:author)

    respond_to do |format|
      format.html {  }
      format.xml  { render :xml => @maps }
      format.json  { render :json => @maps }
    end
  end

    # http://www.zacharyfox.com/blog/ruby-on-rails/password-hashing 
  def show
    @map = Map.find_by_name(params[:id],:order => 'version DESC')
    if @map.password != "" && !Password::check(params[:password],@map.password) && params[:password] != APP_CONFIG["password"]
      flash[:error] = "That password is incorrect." if params[:password] != nil
      redirect_to "/map/login/"+params[:id]+"?to=/maps/"+params[:id]
    else
    @map.zoom = 1.6 if @map.zoom == 0
    @warpables = @map.flush_unplaced_warpables
    @nodes = @map.nodes
    if !@warpables || @warpables && @warpables.length == 1 && @warpables.first.nodes == "none"
      location = GeoKit::GeoLoc.geocode(@map.location)
      @map.lat = location.lat
      @map.lon = location.lng
	puts @map.lat
	puts @map.lon
      @map.save
    end
    render :layout => 'knitter'
    end
  end


end
