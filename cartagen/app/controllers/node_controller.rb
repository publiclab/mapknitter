class NodeController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def write
  	p params
    n = Node.new
    n.color = params[:color]
    n.lat = params[:lat]
    n.lon = params[:lon]
    n.author = params[:author]
    n.save
    render :text => n.id
  end

  def read
    conditions = [[]]
    if params[:bbox]
      bbox = params[:bbox].split(',')
      # counting from left, counter-clockwise
      lon1,lat2,lon2,lat1 = bbox
      conditions[0] << '((lat BETWEEN ? AND ?) OR (lat BETWEEN ? AND ?)) AND ((lon BETWEEN ? AND ?) OR (lon BETWEEN ? AND ?))'
      conditions.push(lat1,lat2,lat2,lat1,lon1,lon2,lon2,lon1)
    end
    if params[:timestamp]
      since = DateTime.parse(params[:timestamp])
      conditions[0] << "updated_at > '?'"
      conditions << since.utc.to_s(:db)
    end
    conditions[0] = conditions[0].join(' AND ')
    nodes = Node.find(:all, :conditions => conditions)
    render :json => nodes
  end
  
end
