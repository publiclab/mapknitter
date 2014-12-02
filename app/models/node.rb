class Node < ActiveRecord::Base
  attr_accessible :body, :lat, :lon, :map_id
  belongs_to :way
  
end
