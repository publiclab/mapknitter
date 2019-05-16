class Way < ActiveRecord::Base
  attr_accessible :body, :lat, :lon, :map_id, :color
  has_many :nodes, :dependent => :destroy
end
