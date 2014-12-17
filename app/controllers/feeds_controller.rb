class FeedsController < ApplicationController

  def all
    #(Warpable.all + Map.all).sort_by(&:created_at)
    @maps = Map.find(:all,:order => "id DESC",:limit => 20, :conditions => {:archived => false, :password => ''},:joins => :warpables, :group => "maps.id")
    render :layout => false
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def plots
    #(Warpable.all + Map.all).sort_by(&:created_at)
    @maps = Map.find(:all,:order => "id DESC",:limit => 20, :conditions => ["archived = false AND password = '' AND license = 'cc-by' AND author != 'anonymous'"],:joins => :exports, :group => "maps.id")
    @maps = @maps+Map.find(:all,:order => "id DESC",:limit => 20, :conditions => ["archived = false AND password = '' AND license = 'publicdomain' AND author != 'anonymous'"],:joins => :exports, :group => "maps.id")
    render :layout => false
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def license
    @maps = Map.find(:all,:order => "id DESC",:limit => 20, :conditions => {:archived => false, :password => '', :license => params[:id]},:joins => :warpables, :group => "maps.id")
    render :layout => false
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def author
    @maps = Map.find_all_by_author(params[:id],:order => "id DESC", :conditions => {:archived => false, :password => ''},:joins => :warpables, :group => "maps.id")
    images = []
    @maps.each do |map|
      images = images + map.warpables
    end
    @feed = (@maps + images).sort_by(&:created_at)
    render :layout => false
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

end
