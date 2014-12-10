class Node < ActiveRecord::Base
  attr_accessible :body, :lat, :lon, :map_id, :way_order, :way_id
  belongs_to :way
  
end
