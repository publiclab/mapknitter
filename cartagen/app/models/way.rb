class Way < ActiveRecord::Base
  has_many :nodes
  
  def bbox=(bbox)
    # counting from left, counter-clockwise
    self.lon1,self.lat2,self.lon2,self.lat1 = bbox
  end
  
end
