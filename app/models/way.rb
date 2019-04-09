class Way < ActiveRecord::Base
  attr_accessible :body, :lat, :lon, :map_id, :color
  has_many :nodes, :dependent => :destroy

  def bbox=(bbox)
    # counting from left, counter-clockwise
    self.lon1,self.lat2,self.lon2,self.lat1 = bbox
  end
end
