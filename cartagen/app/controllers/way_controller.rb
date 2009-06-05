require 'rubygems'
require 'JSON'

class WayController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def write
    json = JSON.parse(params[:way])
    nodes = []
    way = nil
    
    Way.transaction do
      way = Way.new
      way.color = json['color']
      way.bbox = json['bbox']
      way.author = json['author']
    
      json['nodes'].each do |nd|
        node = Node.new
        node.lat = nd[0]
        node.lon = nd[1]
        node.author = way.author
        node.save
        nodes << node
      end

      way.save
    
      # after saving, go back and assign foreign way_id for each node
      nodes.each do |node|
        node.way_id = way.id
        node.save
      end
    end
    
    nodes_hash = nodes.collect {|n| n.id}
    render :json => {:way_id => way.id, :node_ids => nodes_hash}
  end
  
  def read    
    conditions = [[]]
    ######## UNTESTED: ########
    if params[:bbox]
      bbox = params[:bbox].split(',')
      # counting from left, counter-clockwise
      lon1,lat2,lon2,lat1 = bbox
      # box1 = record, box2 = param
      conditions[0] << '? > lon2 AND ? < lon1 AND ? > lat2 AND ? < lat1'
      conditions.push lon1,lon2,lat1,lat2
    end
    ###########################
    if params[:timestamp]
      since = DateTime.parse(params[:timestamp])
      conditions[0] << "updated_at > '?'"
      conditions << since.utc.to_s(:db)
    end
    if params[:ids]
      ids = params[:ids].split(',')
      ids.collect! {|id| id.to_i}
      conditions[0] << "id IN ("+ids.join(",")+")"
    end
    conditions[0] = conditions[0].join(' AND ')
    ways = Way.find(:all, :conditions => conditions)
    render :json => ways    
  end
  
end
